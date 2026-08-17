package com.company.hrm.employee.dto;

import com.company.hrm.employee.domain.EmployeeStatus;
import java.time.LocalDate;

public record EmployeeResponse(
    Long id,
    String employeeCode,
    String fullName,
    LocalDate dob,
    String gender,
    String nationalId,
    String email,
    String phone,
    String address,
    Long departmentId,
    String departmentName,
    Long positionId,
    String positionName,
    Long managerId,
    LocalDate hireDate,
    EmployeeStatus status) {}
