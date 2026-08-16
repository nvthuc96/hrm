package com.company.hrm.employee.repository;

import com.company.hrm.employee.domain.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    boolean existsByEmployeeCode(String employeeCode);

    @Query("""
            SELECT e FROM Employee e
            WHERE (:q IS NULL OR LOWER(e.fullName) LIKE LOWER(CONCAT('%', CAST(:q AS string), '%'))
                                OR LOWER(e.employeeCode) LIKE LOWER(CONCAT('%', CAST(:q AS string), '%')))
              AND (:departmentId IS NULL OR e.department.id = :departmentId)
            """)
    Page<Employee> search(@Param("q") String q,
                          @Param("departmentId") Long departmentId,
                          Pageable pageable);
}
