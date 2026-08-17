package com.company.hrm.attendance.repository;

import com.company.hrm.attendance.domain.Attendance;
import com.company.hrm.attendance.domain.AttendanceStatus;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

  List<Attendance> findByEmployeeIdAndWorkDateBetweenOrderByWorkDate(
      Long employeeId, LocalDate from, LocalDate to);

  boolean existsByEmployeeIdAndWorkDate(Long employeeId, LocalDate workDate);

  long countByEmployeeIdAndStatusAndWorkDateBetween(
      Long employeeId, AttendanceStatus status, LocalDate from, LocalDate to);
}
