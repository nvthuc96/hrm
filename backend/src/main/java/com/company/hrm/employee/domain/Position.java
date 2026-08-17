package com.company.hrm.employee.domain;

import com.company.hrm.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "position")
public class Position extends BaseEntity {

  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private int level = 1;
}
