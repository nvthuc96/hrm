package com.company.hrm.attendance.domain;

import com.company.hrm.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "holiday")
public class Holiday extends BaseEntity {

  @Column(nullable = false, unique = true)
  private LocalDate date;

  @Column(nullable = false)
  private String name;
}
