package com.company.hrm.attendance.dto;

import com.company.hrm.attendance.domain.AttendanceStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record AttendanceResponse(
    Long id,
    Long employeeId,
    String employeeName,
    LocalDate workDate,
    LocalTime checkIn,
    LocalTime checkOut,
    BigDecimal workedHours,
    BigDecimal otHours,
    AttendanceStatus status,
    String source,
    String note) {}
