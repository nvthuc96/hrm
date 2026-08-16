package com.company.hrm.employee.repository;

import com.company.hrm.employee.domain.Department;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
}
