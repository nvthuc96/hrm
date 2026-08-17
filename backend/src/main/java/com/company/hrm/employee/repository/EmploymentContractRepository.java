package com.company.hrm.employee.repository;

import com.company.hrm.employee.domain.EmploymentContract;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmploymentContractRepository extends JpaRepository<EmploymentContract, Long> {

  Optional<EmploymentContract> findFirstByEmployeeIdAndStatusOrderByStartDateDesc(
      Long employeeId, String status);
}
