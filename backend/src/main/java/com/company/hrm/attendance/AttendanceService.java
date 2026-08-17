package com.company.hrm.attendance;

import com.company.hrm.attendance.domain.Attendance;
import com.company.hrm.attendance.domain.AttendanceStatus;
import com.company.hrm.attendance.dto.AttendanceRequest;
import com.company.hrm.attendance.dto.AttendanceResponse;
import com.company.hrm.attendance.dto.MonthlyAttendanceResponse;
import com.company.hrm.attendance.repository.AttendanceRepository;
import com.company.hrm.common.BusinessException;
import com.company.hrm.common.ResourceNotFoundException;
import com.company.hrm.employee.domain.Employee;
import com.company.hrm.employee.repository.EmployeeRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AttendanceService {

  private static final BigDecimal STANDARD_HOURS = new BigDecimal("8");

  private final AttendanceRepository attendanceRepository;
  private final EmployeeRepository employeeRepository;

  public AttendanceService(
      AttendanceRepository attendanceRepository, EmployeeRepository employeeRepository) {
    this.attendanceRepository = attendanceRepository;
    this.employeeRepository = employeeRepository;
  }

  @Transactional(readOnly = true)
  public MonthlyAttendanceResponse monthly(Long employeeId, int year, int month) {
    YearMonth ym = YearMonth.of(year, month);
    LocalDate from = ym.atDay(1);
    LocalDate to = ym.atEndOfMonth();

    List<AttendanceResponse> records =
        attendanceRepository
            .findByEmployeeIdAndWorkDateBetweenOrderByWorkDate(employeeId, from, to)
            .stream()
            .map(AttendanceMapper::toResponse)
            .toList();

    long present = records.stream().filter(r -> r.status() == AttendanceStatus.PRESENT).count();
    long absent = records.stream().filter(r -> r.status() == AttendanceStatus.ABSENT).count();
    long leave = records.stream().filter(r -> r.status() == AttendanceStatus.LEAVE).count();
    BigDecimal totalWorked =
        records.stream()
            .map(AttendanceResponse::workedHours)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    BigDecimal totalOt =
        records.stream().map(AttendanceResponse::otHours).reduce(BigDecimal.ZERO, BigDecimal::add);

    var summary =
        new MonthlyAttendanceResponse.Summary(present, absent, leave, totalWorked, totalOt);
    return new MonthlyAttendanceResponse(year, month, employeeId, records, summary);
  }

  public AttendanceResponse create(AttendanceRequest req) {
    if (attendanceRepository.existsByEmployeeIdAndWorkDate(req.employeeId(), req.workDate())) {
      throw new BusinessException("Đã có chấm công cho nhân viên này trong ngày " + req.workDate());
    }
    Attendance a = new Attendance();
    a.setEmployee(resolveEmployee(req.employeeId()));
    apply(req, a);
    return AttendanceMapper.toResponse(attendanceRepository.save(a));
  }

  public AttendanceResponse update(Long id, AttendanceRequest req) {
    Attendance a =
        attendanceRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Attendance", id));
    if (!a.getEmployee().getId().equals(req.employeeId())
        || !a.getWorkDate().equals(req.workDate())) {
      boolean clash =
          attendanceRepository.existsByEmployeeIdAndWorkDate(req.employeeId(), req.workDate());
      if (clash) {
        throw new BusinessException(
            "Đã có chấm công cho nhân viên này trong ngày " + req.workDate());
      }
      a.setEmployee(resolveEmployee(req.employeeId()));
    }
    apply(req, a);
    return AttendanceMapper.toResponse(attendanceRepository.save(a));
  }

  public void delete(Long id) {
    Attendance a =
        attendanceRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Attendance", id));
    attendanceRepository.delete(a);
  }

  private void apply(AttendanceRequest req, Attendance a) {
    a.setWorkDate(req.workDate());
    a.setCheckIn(req.checkIn());
    a.setCheckOut(req.checkOut());
    a.setStatus(req.status() != null ? req.status() : AttendanceStatus.PRESENT);
    a.setNote(req.note());
    a.setSource("MANUAL");
    computeHours(a);
  }

  /** Worked hours from check-in/out; OT is anything beyond the standard 8h day. */
  private void computeHours(Attendance a) {
    if (a.getStatus() == AttendanceStatus.PRESENT
        && a.getCheckIn() != null
        && a.getCheckOut() != null
        && a.getCheckOut().isAfter(a.getCheckIn())) {
      long minutes = Duration.between(a.getCheckIn(), a.getCheckOut()).toMinutes();
      BigDecimal worked =
          BigDecimal.valueOf(minutes).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
      BigDecimal ot = worked.subtract(STANDARD_HOURS).max(BigDecimal.ZERO);
      a.setWorkedHours(worked);
      a.setOtHours(ot);
    } else {
      a.setWorkedHours(BigDecimal.ZERO);
      a.setOtHours(BigDecimal.ZERO);
    }
  }

  private Employee resolveEmployee(Long id) {
    return employeeRepository
        .findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Employee", id));
  }
}
