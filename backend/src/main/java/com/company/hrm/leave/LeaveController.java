package com.company.hrm.leave;

import com.company.hrm.leave.domain.LeaveStatus;
import com.company.hrm.leave.dto.LeaveBalanceResponse;
import com.company.hrm.leave.dto.LeaveRejectRequest;
import com.company.hrm.leave.dto.LeaveRequestCreate;
import com.company.hrm.leave.dto.LeaveRequestResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
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

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @GetMapping
    public List<LeaveRequestResponse> search(
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) LeaveStatus status) {
        return leaveService.search(employeeId, status);
    }

    @GetMapping("/balances")
    public List<LeaveBalanceResponse> balances(
            @RequestParam Long employeeId,
            @RequestParam(required = false) Integer year) {
        int y = year != null ? year : LocalDate.now().getYear();
        return leaveService.balances(employeeId, y);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LeaveRequestResponse create(@Valid @RequestBody LeaveRequestCreate request) {
        return leaveService.create(request);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','HR','MANAGER')")
    public LeaveRequestResponse approve(@PathVariable Long id) {
        return leaveService.approve(id);
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN','HR','MANAGER')")
    public LeaveRequestResponse reject(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) LeaveRejectRequest body) {
        return leaveService.reject(id, body != null ? body.note() : null);
    }

    @PostMapping("/{id}/cancel")
    public LeaveRequestResponse cancel(@PathVariable Long id) {
        return leaveService.cancel(id);
    }
}
