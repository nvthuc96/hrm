package com.company.hrm.payroll.domain;

import com.company.hrm.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(
    name = "payroll_period",
    uniqueConstraints =
        @UniqueConstraint(
            name = "uq_payroll_period",
            columnNames = {"month", "year"}))
public class PayrollPeriod extends BaseEntity {

  @Column(nullable = false)
  private int month;

  @Column(nullable = false)
  private int year;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private PeriodStatus status = PeriodStatus.OPEN;
}
