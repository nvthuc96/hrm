package com.company.hrm.payroll.dto;

import com.company.hrm.payroll.domain.ComponentType;
import java.math.BigDecimal;
import java.util.List;

public record PayslipResponse(
    Long id,
    Long employeeId,
    String employeeName,
    Long periodId,
    int month,
    int year,
    int workingDays,
    BigDecimal baseSalary,
    BigDecimal totalAllowance,
    BigDecimal totalDeduction,
    BigDecimal gross,
    BigDecimal insurance,
    BigDecimal tax,
    BigDecimal netSalary,
    List<Detail> details) {
  public record Detail(String name, ComponentType type, BigDecimal amount) {}
}
