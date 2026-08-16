package com.company.hrm.payroll;

import com.company.hrm.export.ExportResponse;
import com.company.hrm.payroll.domain.PeriodStatus;
import com.company.hrm.payroll.dto.PayrollPeriodRequest;
import com.company.hrm.payroll.dto.PayrollPeriodResponse;
import com.company.hrm.payroll.dto.PayslipResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/payroll")
public class PayrollController {

    private final PayrollService payrollService;

    public PayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    @GetMapping("/periods")
    public List<PayrollPeriodResponse> periods() {
        return payrollService.listPeriods();
    }

    @PostMapping("/periods")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public PayrollPeriodResponse createPeriod(@Valid @RequestBody PayrollPeriodRequest request) {
        return payrollService.createPeriod(request.month(), request.year());
    }

    @PostMapping("/periods/{id}/lock")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public PayrollPeriodResponse lock(@PathVariable Long id) {
        return payrollService.setStatus(id, PeriodStatus.LOCKED);
    }

    @PostMapping("/periods/{id}/unlock")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public PayrollPeriodResponse unlock(@PathVariable Long id) {
        return payrollService.setStatus(id, PeriodStatus.OPEN);
    }

    @PostMapping("/periods/{id}/generate")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public List<PayslipResponse> generate(
            @PathVariable Long id,
            @RequestParam(required = false) Long employeeId) {
        if (employeeId != null) {
            return List.of(payrollService.generateOne(id, employeeId));
        }
        return payrollService.generateAll(id);
    }

    @GetMapping("/payslips")
    public List<PayslipResponse> payslips(@RequestParam Long periodId) {
        return payrollService.listPayslips(periodId);
    }

    @GetMapping("/payslips/{id}")
    public PayslipResponse payslip(@PathVariable Long id) {
        return payrollService.getPayslip(id);
    }

    @GetMapping("/payslips/export")
    public ResponseEntity<byte[]> exportPayslips(@RequestParam Long periodId) {
        byte[] body = payrollService.exportXlsx(periodId);
        return ExportResponse.xlsx(body, "bang-luong-" + payrollService.periodLabel(periodId) + ".xlsx");
    }
}
