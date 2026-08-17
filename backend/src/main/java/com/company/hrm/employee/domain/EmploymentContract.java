package com.company.hrm.employee.domain;

import com.company.hrm.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "employment_contract")
public class EmploymentContract extends BaseEntity {

  @ManyToOne
  @JoinColumn(name = "employee_id", nullable = false)
  private Employee employee;

  @Column(name = "contract_type", nullable = false)
  private String contractType;

  @Column(name = "start_date", nullable = false)
  private LocalDate startDate;

  @Column(name = "end_date")
  private LocalDate endDate;

  @Column(name = "base_salary", nullable = false)
  private BigDecimal baseSalary = BigDecimal.ZERO;

  @Column(nullable = false)
  private String status = "ACTIVE";
}
