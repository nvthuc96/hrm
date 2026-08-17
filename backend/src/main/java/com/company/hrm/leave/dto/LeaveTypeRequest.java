package com.company.hrm.leave.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

public record LeaveTypeRequest(
    @NotBlank String name, boolean paid, @PositiveOrZero int maxDaysPerYear) {}
