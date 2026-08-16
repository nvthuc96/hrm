package com.company.hrm.employee.dto;

import jakarta.validation.constraints.NotBlank;

public record DepartmentRequest(
        @NotBlank String name,
        Long parentId,
        Long managerId
) {
}
