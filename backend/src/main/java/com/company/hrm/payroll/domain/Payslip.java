package com.company.hrm.payroll.domain;

import com.company.hrm.common.BaseEntity;
import com.company.hrm.employee.domain.Employee;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(
    name = "payslip",
    uniqueConstraints =
        @UniqueConstraint(
            name = "uq_payslip",
            columnNames = {"employee_id", "period_id"}))
public class Payslip extends BaseEntity {

  @ManyToOne
  @JoinColumn(name = "employee_id", nullable = false)
  private Employee employee;

  @ManyToOne
  @JoinColumn(name = "period_id", nullable = false)
  private PayrollPeriod period;

  @Column(name = "working_days", nullable = false)
  private int workingDays;

  @Column(name = "base_salary", nullable = false)
  private BigDecimal baseSalary = BigDecimal.ZERO;

  @Column(name = "total_allowance", nullable = false)
  private BigDecimal totalAllowance = BigDecimal.ZERO;

  @Column(name = "total_deduction", nullable = false)
  private BigDecimal totalDeduction = BigDecimal.ZERO;

  @Column(nullable = false)
  private BigDecimal gross = BigDecimal.ZERO;

  @Column(nullable = false)
  private BigDecimal insurance = BigDecimal.ZERO;

  @Column(nullable = false)
  private BigDecimal tax = BigDecimal.ZERO;

  @Column(name = "net_salary", nullable = false)
  private BigDecimal netSalary = BigDecimal.ZERO;

  @OneToMany(mappedBy = "payslip", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<PayslipDetail> details = new ArrayList<>();

  public void addDetail(PayslipDetail d) {
    d.setPayslip(this);
    details.add(d);
  }
}
