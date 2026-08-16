package com.company.hrm.attendance.dto;

import com.company.hrm.attendance.domain.AttendanceStatus;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record AttendanceRequest(
        @NotNull Long employeeId,
        @NotNull LocalDate workDate,
        LocalTime checkIn,
        LocalTime checkOut,
        AttendanceStatus status,
        String note
) {
}
