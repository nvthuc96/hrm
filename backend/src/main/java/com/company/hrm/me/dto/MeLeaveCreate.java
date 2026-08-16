package com.company.hrm.me.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/**
 * Self-service leave request. The employee is taken from the authenticated
 * account, never from the client, so a user cannot file leave for someone else.
 */
public record MeLeaveCreate(
        @NotNull Long leaveTypeId,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        String reason
) {
}
