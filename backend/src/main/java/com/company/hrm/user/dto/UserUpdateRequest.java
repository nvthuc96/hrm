package com.company.hrm.user.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record UserUpdateRequest(
    @NotEmpty(message = "Chọn ít nhất một vai trò") List<String> roles,
    Long employeeId,
    Boolean enabled) {}
