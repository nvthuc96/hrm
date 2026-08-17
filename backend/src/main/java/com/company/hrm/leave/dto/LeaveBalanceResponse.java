package com.company.hrm.leave.dto;

public record LeaveBalanceResponse(
    Long leaveTypeId, String leaveTypeName, int year, int entitled, int used, int remaining) {}
