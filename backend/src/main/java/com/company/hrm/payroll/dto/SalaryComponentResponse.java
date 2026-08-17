package com.company.hrm.payroll.dto;

import com.company.hrm.payroll.domain.ComponentType;
import java.math.BigDecimal;

public record SalaryComponentResponse(
    Long id, String name, ComponentType type, boolean taxable, BigDecimal defaultAmount) {}
