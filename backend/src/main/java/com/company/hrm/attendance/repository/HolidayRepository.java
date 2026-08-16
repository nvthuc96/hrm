package com.company.hrm.attendance.repository;

import com.company.hrm.attendance.domain.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HolidayRepository extends JpaRepository<Holiday, Long> {
}
