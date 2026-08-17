package com.company.hrm.payroll.repository;

import com.company.hrm.payroll.domain.PayrollPeriod;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PayrollPeriodRepository extends JpaRepository<PayrollPeriod, Long> {

  Optional<PayrollPeriod> findByMonthAndYear(int month, int year);

  List<PayrollPeriod> findAllByOrderByYearDescMonthDesc();
}
