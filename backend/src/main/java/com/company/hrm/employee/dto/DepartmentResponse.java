package com.company.hrm.employee.dto;

public record DepartmentResponse(
    Long id, String name, Long parentId, String parentName, Long managerId) {}
