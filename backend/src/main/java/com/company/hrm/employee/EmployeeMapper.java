package com.company.hrm.employee;

import com.company.hrm.employee.domain.Department;
import com.company.hrm.employee.domain.Employee;
import com.company.hrm.employee.domain.Position;
import com.company.hrm.employee.dto.DepartmentResponse;
import com.company.hrm.employee.dto.EmployeeResponse;
import com.company.hrm.employee.dto.PositionResponse;

public final class EmployeeMapper {

  private EmployeeMapper() {}

  public static EmployeeResponse toResponse(Employee e) {
    Department dept = e.getDepartment();
    Position pos = e.getPosition();
    return new EmployeeResponse(
        e.getId(),
        e.getEmployeeCode(),
        e.getFullName(),
        e.getDob(),
        e.getGender(),
        e.getNationalId(),
        e.getEmail(),
        e.getPhone(),
        e.getAddress(),
        dept != null ? dept.getId() : null,
        dept != null ? dept.getName() : null,
        pos != null ? pos.getId() : null,
        pos != null ? pos.getName() : null,
        e.getManagerId(),
        e.getHireDate(),
        e.getStatus());
  }

  public static DepartmentResponse toResponse(Department d) {
    Department parent = d.getParent();
    return new DepartmentResponse(
        d.getId(),
        d.getName(),
        parent != null ? parent.getId() : null,
        parent != null ? parent.getName() : null,
        d.getManagerId());
  }

  public static PositionResponse toResponse(Position p) {
    return new PositionResponse(p.getId(), p.getName(), p.getLevel());
  }
}
