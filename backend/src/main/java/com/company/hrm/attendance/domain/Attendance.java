package com.company.hrm.attendance.domain;

import com.company.hrm.common.BaseEntity;
import com.company.hrm.employee.domain.Employee;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(
    name = "attendance",
    uniqueConstraints =
        @UniqueConstraint(
            name = "uq_attendance_emp_date",
            columnNames = {"employee_id", "work_date"}))
public class Attendance extends BaseEntity {

  @ManyToOne
  @JoinColumn(name = "employee_id", nullable = false)
  private Employee employee;

  @Column(name = "work_date", nullable = false)
  private LocalDate workDate;

  @Column(name = "check_in")
  private LocalTime checkIn;

  @Column(name = "check_out")
  private LocalTime checkOut;

  @Column(name = "worked_hours", nullable = false)
  private BigDecimal workedHours = BigDecimal.ZERO;

  @Column(name = "ot_hours", nullable = false)
  private BigDecimal otHours = BigDecimal.ZERO;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private AttendanceStatus status = AttendanceStatus.PRESENT;

  @Column(nullable = false)
  private String source = "MANUAL";

  private String note;
}
