package com.company.hrm.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

public record UserCreateRequest(
    @NotBlank(message = "Tên đăng nhập không được trống")
        @Size(min = 3, max = 50, message = "Tên đăng nhập từ 3–50 ký tự")
        String username,
    @NotBlank(message = "Mật khẩu không được trống")
        @Size(min = 6, max = 100, message = "Mật khẩu tối thiểu 6 ký tự")
        String password,
    @NotEmpty(message = "Chọn ít nhất một vai trò") List<String> roles,
    Long employeeId,
    Boolean enabled) {}
