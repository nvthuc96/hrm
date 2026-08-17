package com.company.hrm.leave.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record LeaveRequestCreate(
    @NotNull Long employeeId,
    @NotNull Long leaveTypeId,
    @NotNull LocalDate startDate,
    @NotNull LocalDate endDate,
    String reason) {}
