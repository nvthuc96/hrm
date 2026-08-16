package com.company.hrm.leave;

import com.company.hrm.employee.domain.Employee;
import com.company.hrm.leave.domain.LeaveBalance;
import com.company.hrm.leave.domain.LeaveRequest;
import com.company.hrm.leave.domain.LeaveType;
import com.company.hrm.leave.dto.LeaveBalanceResponse;
import com.company.hrm.leave.dto.LeaveRequestResponse;
import com.company.hrm.leave.dto.LeaveTypeResponse;

public final class LeaveMapper {

    private LeaveMapper() {
    }

    public static LeaveTypeResponse toResponse(LeaveType t) {
        return new LeaveTypeResponse(t.getId(), t.getName(), t.isPaid(), t.getMaxDaysPerYear());
    }

    public static LeaveRequestResponse toResponse(LeaveRequest r) {
        Employee emp = r.getEmployee();
        Employee approver = r.getApprover();
        LeaveType type = r.getLeaveType();
        return new LeaveRequestResponse(
                r.getId(),
                emp != null ? emp.getId() : null,
                emp != null ? emp.getFullName() : null,
                type != null ? type.getId() : null,
                type != null ? type.getName() : null,
                r.getStartDate(),
                r.getEndDate(),
                r.getDays(),
                r.getReason(),
                r.getStatus(),
                approver != null ? approver.getFullName() : null,
                r.getDecisionNote()
        );
    }

    public static LeaveBalanceResponse toResponse(LeaveBalance b) {
        return new LeaveBalanceResponse(
                b.getLeaveType().getId(),
                b.getLeaveType().getName(),
                b.getYear(),
                b.getEntitled(),
                b.getUsed(),
                b.getRemaining()
        );
    }
}
