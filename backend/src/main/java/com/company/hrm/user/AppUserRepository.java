package com.company.hrm.user;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
  Optional<AppUser> findByUsername(String username);

  boolean existsByUsername(String username);

  /** Accounts linked to a given employee (usually zero or one). */
  List<AppUser> findByEmployeeId(Long employeeId);

  /** Enabled accounts having any of the given role names (e.g. leave approvers). */
  List<AppUser> findDistinctByEnabledTrueAndRoles_NameIn(Collection<String> roleNames);
}
