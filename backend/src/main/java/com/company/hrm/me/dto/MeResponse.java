package com.company.hrm.me.dto;

import com.company.hrm.employee.dto.EmployeeResponse;
import java.util.List;

/**
 * The current user's own account snapshot: identity, roles and (when linked) their employee
 * profile. {@code employee} is null when the account is not linked to an employee record.
 */
public record MeResponse(
    String username, List<String> roles, Long employeeId, EmployeeResponse employee) {}
