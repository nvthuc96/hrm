package com.company.hrm.employee.repository;

import com.company.hrm.employee.domain.EmploymentContract;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmploymentContractRepository extends JpaRepository<EmploymentContract, Long> {

    Optional<EmploymentContract> findFirstByEmployeeIdAndStatusOrderByStartDateDesc(
            Long employeeId, String status);
}
