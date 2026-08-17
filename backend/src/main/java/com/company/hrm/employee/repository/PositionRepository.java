package com.company.hrm.employee.repository;

import com.company.hrm.employee.domain.Position;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PositionRepository extends JpaRepository<Position, Long> {}
