package com.company.hrm.leave.dto;

import jakarta.validation.constraints.Size;

/** Lý do từ chối đơn nghỉ (tùy chọn, tối đa 500 ký tự). */
public record LeaveRejectRequest(
        @Size(max = 500, message = "Lý do từ chối tối đa 500 ký tự")
        String note
) {
}
