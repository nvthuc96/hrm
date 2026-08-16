package com.company.hrm.leave.repository;

import com.company.hrm.leave.domain.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LeaveTypeRepository extends JpaRepository<LeaveType, Long> {
}
