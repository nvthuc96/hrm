package com.company.hrm.me;

import com.company.hrm.common.BusinessException;
import com.company.hrm.user.AppUser;
import com.company.hrm.user.AppUserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/**
 * Resolves the currently authenticated {@link AppUser} from the security context. Used by
 * self-service endpoints so a logged-in user can only touch their own data.
 */
@Service
public class CurrentUserService {

  private final AppUserRepository userRepository;

  public CurrentUserService(AppUserRepository userRepository) {
    this.userRepository = userRepository;
  }

  /** The authenticated AppUser, or throws if the session is somehow anonymous. */
  public AppUser requireUser() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || auth.getName() == null) {
      throw new BusinessException("Chưa đăng nhập");
    }
    return userRepository
        .findByUsername(auth.getName())
        .orElseThrow(() -> new BusinessException("Không tìm thấy tài khoản đang đăng nhập"));
  }

  /**
   * The employee id linked to the current account. Employees self-service only works when the
   * account is linked to an employee record.
   */
  public Long requireEmployeeId() {
    Long employeeId = requireUser().getEmployeeId();
    if (employeeId == null) {
      throw new BusinessException(
          "Tài khoản của bạn chưa được liên kết với hồ sơ nhân viên. "
              + "Vui lòng liên hệ quản trị/nhân sự.");
    }
    return employeeId;
  }
}
