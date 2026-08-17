package com.company.hrm.user;

import com.company.hrm.common.BusinessException;
import com.company.hrm.common.ResourceNotFoundException;
import com.company.hrm.employee.domain.Employee;
import com.company.hrm.employee.repository.EmployeeRepository;
import com.company.hrm.user.dto.PasswordResetRequest;
import com.company.hrm.user.dto.RoleResponse;
import com.company.hrm.user.dto.UserCreateRequest;
import com.company.hrm.user.dto.UserResponse;
import com.company.hrm.user.dto.UserUpdateRequest;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserService {

  private static final String ROLE_ADMIN = "ROLE_ADMIN";

  private final AppUserRepository userRepository;
  private final RoleRepository roleRepository;
  private final EmployeeRepository employeeRepository;
  private final PasswordEncoder passwordEncoder;

  public UserService(
      AppUserRepository userRepository,
      RoleRepository roleRepository,
      EmployeeRepository employeeRepository,
      PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
    this.employeeRepository = employeeRepository;
    this.passwordEncoder = passwordEncoder;
  }

  @Transactional(readOnly = true)
  public List<UserResponse> list() {
    List<AppUser> users = userRepository.findAll();
    Map<Long, String> empNames = employeeNames(users);
    return users.stream()
        .sorted(Comparator.comparing(AppUser::getUsername, String.CASE_INSENSITIVE_ORDER))
        .map(u -> toResponse(u, empNames))
        .toList();
  }

  @Transactional(readOnly = true)
  public List<RoleResponse> roles() {
    return roleRepository.findAll().stream()
        .map(r -> new RoleResponse(r.getId(), r.getName()))
        .sorted(Comparator.comparing(RoleResponse::name))
        .toList();
  }

  public UserResponse create(UserCreateRequest req) {
    if (userRepository.existsByUsername(req.username())) {
      throw new BusinessException("Tên đăng nhập đã tồn tại: " + req.username());
    }
    AppUser user = new AppUser();
    user.setUsername(req.username().trim());
    user.setPasswordHash(passwordEncoder.encode(req.password()));
    user.setEnabled(req.enabled() == null || req.enabled());
    user.setEmployeeId(req.employeeId());
    user.setRoles(resolveRoles(req.roles()));
    return toResponse(userRepository.save(user), employeeNames(List.of(user)));
  }

  public UserResponse update(Long id, UserUpdateRequest req) {
    AppUser user = findUser(id);
    Set<Role> newRoles = resolveRoles(req.roles());
    boolean newEnabled = req.enabled() == null || req.enabled();

    boolean losesAdmin =
        isAdmin(user)
            && (newRoles.stream().noneMatch(r -> ROLE_ADMIN.equals(r.getName())) || !newEnabled);
    if (losesAdmin) {
      ensureNotLastActiveAdmin(user);
    }

    user.setRoles(newRoles);
    user.setEnabled(newEnabled);
    user.setEmployeeId(req.employeeId());
    return toResponse(userRepository.save(user), employeeNames(List.of(user)));
  }

  public void resetPassword(Long id, PasswordResetRequest req) {
    AppUser user = findUser(id);
    user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
    userRepository.save(user);
  }

  public void delete(Long id, String currentUsername) {
    AppUser user = findUser(id);
    if (user.getUsername().equalsIgnoreCase(currentUsername)) {
      throw new BusinessException("Không thể xóa tài khoản đang đăng nhập");
    }
    if (isAdmin(user) && user.isEnabled()) {
      ensureNotLastActiveAdmin(user);
    }
    userRepository.delete(user);
  }

  // ----- helpers -----

  private Set<Role> resolveRoles(List<String> names) {
    Set<Role> roles = new HashSet<>();
    for (String name : names) {
      Role role =
          roleRepository
              .findByName(name)
              .orElseThrow(() -> new BusinessException("Vai trò không hợp lệ: " + name));
      roles.add(role);
    }
    return roles;
  }

  private boolean isAdmin(AppUser user) {
    return user.getRoles().stream().anyMatch(r -> ROLE_ADMIN.equals(r.getName()));
  }

  /** Chặn thao tác khiến hệ thống không còn admin nào đang hoạt động. */
  private void ensureNotLastActiveAdmin(AppUser candidate) {
    long otherActiveAdmins =
        userRepository.findAll().stream()
            .filter(u -> !u.getId().equals(candidate.getId()))
            .filter(AppUser::isEnabled)
            .filter(this::isAdmin)
            .count();
    if (otherActiveAdmins == 0) {
      throw new BusinessException("Phải còn ít nhất một quản trị viên (ADMIN) đang hoạt động");
    }
  }

  private Map<Long, String> employeeNames(List<AppUser> users) {
    List<Long> ids =
        users.stream()
            .map(AppUser::getEmployeeId)
            .filter(java.util.Objects::nonNull)
            .distinct()
            .toList();
    if (ids.isEmpty()) {
      return Map.of();
    }
    return employeeRepository.findAllById(ids).stream()
        .collect(Collectors.toMap(Employee::getId, Employee::getFullName));
  }

  private UserResponse toResponse(AppUser u, Map<Long, String> empNames) {
    List<String> roleNames = u.getRoles().stream().map(Role::getName).sorted().toList();
    String empName = u.getEmployeeId() != null ? empNames.get(u.getEmployeeId()) : null;
    return new UserResponse(
        u.getId(), u.getUsername(), u.isEnabled(), u.getEmployeeId(), empName, roleNames);
  }

  private AppUser findUser(Long id) {
    return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", id));
  }
}
