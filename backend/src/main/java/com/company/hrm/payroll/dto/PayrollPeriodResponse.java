package com.company.hrm.payroll.dto;

import com.company.hrm.payroll.domain.PeriodStatus;

public record PayrollPeriodResponse(
        Long id,
        int month,
        int year,
        PeriodStatus status
) {
}
