package com.company.hrm.payroll.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record PayrollPeriodRequest(@Min(1) @Max(12) int month, @Min(2000) int year) {}
