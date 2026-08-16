package com.company.hrm.payroll;

import com.company.hrm.payroll.domain.PayrollPeriod;
import com.company.hrm.payroll.domain.Payslip;
import com.company.hrm.payroll.domain.SalaryComponent;
import com.company.hrm.payroll.dto.PayrollPeriodResponse;
import com.company.hrm.payroll.dto.PayslipResponse;
import com.company.hrm.payroll.dto.SalaryComponentResponse;

import java.util.List;

public final class PayrollMapper {

    private PayrollMapper() {
    }

    public static SalaryComponentResponse toResponse(SalaryComponent c) {
        return new SalaryComponentResponse(c.getId(), c.getName(), c.getType(),
                c.isTaxable(), c.getDefaultAmount());
    }

    public static PayrollPeriodResponse toResponse(PayrollPeriod p) {
        return new PayrollPeriodResponse(p.getId(), p.getMonth(), p.getYear(), p.getStatus());
    }

    public static PayslipResponse toResponse(Payslip s) {
        List<PayslipResponse.Detail> details = s.getDetails().stream()
                .map(d -> new PayslipResponse.Detail(d.getName(), d.getType(), d.getAmount()))
                .toList();
        return new PayslipResponse(
                s.getId(),
                s.getEmployee().getId(),
                s.getEmployee().getFullName(),
                s.getPeriod().getId(),
                s.getPeriod().getMonth(),
                s.getPeriod().getYear(),
                s.getWorkingDays(),
                s.getBaseSalary(),
                s.getTotalAllowance(),
                s.getTotalDeduction(),
                s.getGross(),
                s.getInsurance(),
                s.getTax(),
                s.getNetSalary(),
                details
        );
    }
}
