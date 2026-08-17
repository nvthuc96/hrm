package com.company.hrm.leave.dto;

public record LeaveTypeResponse(Long id, String name, boolean paid, int maxDaysPerYear) {}
