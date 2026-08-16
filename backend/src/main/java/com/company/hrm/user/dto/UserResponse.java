package com.company.hrm.user.dto;

import java.util.List;

public record UserResponse(
        Long id,
        String username,
        boolean enabled,
        Long employeeId,
        String employeeName,
        List<String> roles
) {
}
