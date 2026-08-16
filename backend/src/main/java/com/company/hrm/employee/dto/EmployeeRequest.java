package com.company.hrm.employee.dto;

import com.company.hrm.employee.domain.EmployeeStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record EmployeeRequest(
        @NotBlank String employeeCode,
        @NotBlank String fullName,
        LocalDate dob,
        String gender,
        String nationalId,
        @Email String email,
        String phone,
        String address,
        Long departmentId,
        Long positionId,
        Long managerId,
        LocalDate hireDate,
        EmployeeStatus status
) {
}
