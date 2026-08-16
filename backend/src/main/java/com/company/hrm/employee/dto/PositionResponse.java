package com.company.hrm.employee.dto;

public record PositionResponse(
        Long id,
        String name,
        int level
) {
}
