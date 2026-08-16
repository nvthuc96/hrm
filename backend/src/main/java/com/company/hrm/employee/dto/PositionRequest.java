package com.company.hrm.employee.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record PositionRequest(
        @NotBlank String name,
        @Positive int level
) {
}
