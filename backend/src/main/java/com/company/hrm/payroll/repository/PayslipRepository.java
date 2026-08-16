package com.company.hrm.payroll.repository;

import com.company.hrm.payroll.domain.Payslip;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PayslipRepository extends JpaRepository<Payslip, Long> {

    List<Payslip> findByPeriodIdOrderByEmployee_FullName(Long periodId);

    Optional<Payslip> findByEmployeeIdAndPeriodId(Long employeeId, Long periodId);
}
