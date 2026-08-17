package com.company.hrm.payroll.domain;

import com.company.hrm.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "salary_component")
public class SalaryComponent extends BaseEntity {

  @Column(nullable = false)
  private String name;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private ComponentType type;

  @Column(name = "is_taxable", nullable = false)
  private boolean taxable = true;

  @Column(name = "default_amount", nullable = false)
  private BigDecimal defaultAmount = BigDecimal.ZERO;
}
