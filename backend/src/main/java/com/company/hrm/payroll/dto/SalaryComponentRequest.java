package com.company.hrm.payroll.dto;

import com.company.hrm.payroll.domain.ComponentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record SalaryComponentRequest(
    @NotBlank String name,
    @NotNull ComponentType type,
    boolean taxable,
    @NotNull BigDecimal defaultAmount) {}
