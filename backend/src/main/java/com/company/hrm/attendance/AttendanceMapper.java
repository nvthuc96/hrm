package com.company.hrm.attendance;

import com.company.hrm.attendance.domain.Attendance;
import com.company.hrm.attendance.dto.AttendanceResponse;
import com.company.hrm.employee.domain.Employee;

public final class AttendanceMapper {

  private AttendanceMapper() {}

  public static AttendanceResponse toResponse(Attendance a) {
    Employee e = a.getEmployee();
    return new AttendanceResponse(
        a.getId(),
        e != null ? e.getId() : null,
        e != null ? e.getFullName() : null,
        a.getWorkDate(),
        a.getCheckIn(),
        a.getCheckOut(),
        a.getWorkedHours(),
        a.getOtHours(),
        a.getStatus(),
        a.getSource(),
        a.getNote());
  }
}
