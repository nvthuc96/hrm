package com.company.hrm.attendance;

import com.company.hrm.attendance.dto.AttendanceRequest;
import com.company.hrm.attendance.dto.AttendanceResponse;
import com.company.hrm.attendance.dto.MonthlyAttendanceResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

  private final AttendanceService attendanceService;

  public AttendanceController(AttendanceService attendanceService) {
    this.attendanceService = attendanceService;
  }

  @GetMapping("/monthly")
  public MonthlyAttendanceResponse monthly(
      @RequestParam Long employeeId, @RequestParam int year, @RequestParam int month) {
    return attendanceService.monthly(employeeId, year, month);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("hasAnyRole('ADMIN','HR','MANAGER')")
  public AttendanceResponse create(@Valid @RequestBody AttendanceRequest request) {
    return attendanceService.create(request);
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','HR','MANAGER')")
  public AttendanceResponse update(
      @PathVariable Long id, @Valid @RequestBody AttendanceRequest request) {
    return attendanceService.update(id, request);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @PreAuthorize("hasAnyRole('ADMIN','HR')")
  public void delete(@PathVariable Long id) {
    attendanceService.delete(id);
  }
}
