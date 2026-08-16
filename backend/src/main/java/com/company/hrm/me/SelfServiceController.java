package com.company.hrm.me;

import com.company.hrm.attendance.AttendanceService;
import com.company.hrm.attendance.dto.MonthlyAttendanceResponse;
import com.company.hrm.employee.EmployeeService;
import com.company.hrm.employee.dto.EmployeeResponse;
import com.company.hrm.leave.LeaveService;
import com.company.hrm.leave.dto.LeaveBalanceResponse;
import com.company.hrm.leave.dto.LeaveRequestCreate;
import com.company.hrm.leave.dto.LeaveRequestResponse;
import com.company.hrm.me.dto.MeLeaveCreate;
import com.company.hrm.me.dto.MeResponse;
import com.company.hrm.user.AppUser;
import com.company.hrm.user.Role;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

/**
 * Employee self-service. Every endpoint operates on the authenticated user's
 * own employee record; the employee id is resolved from the JWT, never trusted
 * from the request body or query string.
 */
@RestController
@RequestMapping("/api/me")
public class SelfServiceController {

    private final CurrentUserService currentUser;
    private final EmployeeService employeeService;
    private final AttendanceService attendanceService;
    private final LeaveService leaveService;

    public SelfServiceController(CurrentUserService currentUser,
                                 EmployeeService employeeService,
                                 AttendanceService attendanceService,
                                 LeaveService leaveService) {
        this.currentUser = currentUser;
        this.employeeService = employeeService;
        this.attendanceService = attendanceService;
        this.leaveService = leaveService;
    }

    /** Own account + linked employee profile (employee may be null if unlinked). */
    @GetMapping
    public MeResponse me() {
        AppUser user = currentUser.requireUser();
        List<String> roles = user.getRoles().stream().map(Role::getName).sorted().toList();
        EmployeeResponse employee = user.getEmployeeId() != null
                ? employeeService.getById(user.getEmployeeId())
                : null;
        return new MeResponse(user.getUsername(), roles, user.getEmployeeId(), employee);
    }

    /** Own attendance for a month (defaults to the current month). */
    @GetMapping("/attendance")
    public MonthlyAttendanceResponse attendance(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        LocalDate now = LocalDate.now();
        int y = year != null ? year : now.getYear();
        int m = month != null ? month : now.getMonthValue();
        return attendanceService.monthly(currentUser.requireEmployeeId(), y, m);
    }

    /** Own leave requests. */
    @GetMapping("/leaves")
    public List<LeaveRequestResponse> leaves() {
        return leaveService.search(currentUser.requireEmployeeId(), null);
    }

    /** Own leave balances for a year (defaults to the current year). */
    @GetMapping("/leave-balances")
    public List<LeaveBalanceResponse> leaveBalances(@RequestParam(required = false) Integer year) {
        int y = year != null ? year : LocalDate.now().getYear();
        return leaveService.balances(currentUser.requireEmployeeId(), y);
    }

    /** File a leave request for myself. */
    @PostMapping("/leaves")
    @ResponseStatus(HttpStatus.CREATED)
    public LeaveRequestResponse createLeave(@Valid @RequestBody MeLeaveCreate req) {
        LeaveRequestCreate create = new LeaveRequestCreate(
                currentUser.requireEmployeeId(),
                req.leaveTypeId(),
                req.startDate(),
                req.endDate(),
                req.reason());
        return leaveService.create(create);
    }

    /** Cancel one of my own pending leave requests. */
    @PostMapping("/leaves/{id}/cancel")
    public LeaveRequestResponse cancelLeave(@PathVariable Long id) {
        return leaveService.cancelForEmployee(id, currentUser.requireEmployeeId());
    }
}
