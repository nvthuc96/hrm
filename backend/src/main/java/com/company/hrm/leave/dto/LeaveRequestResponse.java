package com.company.hrm.leave.dto;

import com.company.hrm.leave.domain.LeaveStatus;

import java.time.LocalDate;

public record LeaveRequestResponse(
        Long id,
        Long employeeId,
        String employeeName,
        Long leaveTypeId,
        String leaveTypeName,
        LocalDate startDate,
        LocalDate endDate,
        int days,
        String reason,
        LeaveStatus status,
        String approverName,
        String decisionNote
) {
}
