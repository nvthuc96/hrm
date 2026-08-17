package com.company.hrm.leave.domain;

import com.company.hrm.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "leave_type")
public class LeaveType extends BaseEntity {

  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private boolean paid = true;

  @Column(name = "max_days_per_year", nullable = false)
  private int maxDaysPerYear = 0;
}
