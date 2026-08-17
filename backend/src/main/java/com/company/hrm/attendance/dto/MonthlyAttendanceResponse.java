package com.company.hrm.attendance.dto;

import java.math.BigDecimal;
import java.util.List;

public record MonthlyAttendanceResponse(
    int year, int month, Long employeeId, List<AttendanceResponse> records, Summary summary) {
  public record Summary(
      long presentDays,
      long absentDays,
      long leaveDays,
      BigDecimal totalWorkedHours,
      BigDecimal totalOtHours) {}
}
