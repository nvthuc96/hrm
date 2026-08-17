package com.company.hrm.employee.domain;

import com.company.hrm.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "employee")
public class Employee extends BaseEntity {

  @Column(name = "employee_code", nullable = false, unique = true)
  private String employeeCode;

  @Column(name = "full_name", nullable = false)
  private String fullName;

  private LocalDate dob;

  private String gender;

  @Column(name = "national_id")
  private String nationalId;

  private String email;

  private String phone;

  private String address;

  @ManyToOne
  @JoinColumn(name = "department_id")
  private Department department;

  @ManyToOne
  @JoinColumn(name = "position_id")
  private Position position;

  @Column(name = "manager_id")
  private Long managerId;

  @Column(name = "hire_date")
  private LocalDate hireDate;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private EmployeeStatus status = EmployeeStatus.ACTIVE;
}
