package com.company.hrm.leave.repository;

import com.company.hrm.leave.domain.LeaveRequest;
import com.company.hrm.leave.domain.LeaveStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

  @Query(
      """
            SELECT r FROM LeaveRequest r
            WHERE (:employeeId IS NULL OR r.employee.id = :employeeId)
              AND (:status IS NULL OR r.status = :status)
            ORDER BY r.createdAt DESC
            """)
  List<LeaveRequest> search(
      @Param("employeeId") Long employeeId, @Param("status") LeaveStatus status);
}
