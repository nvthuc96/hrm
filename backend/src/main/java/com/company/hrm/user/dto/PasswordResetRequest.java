package com.company.hrm.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PasswordResetRequest(
    @NotBlank(message = "Mật khẩu không được trống")
        @Size(min = 6, max = 100, message = "Mật khẩu tối thiểu 6 ký tự")
        String newPassword) {}
