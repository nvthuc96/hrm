package com.company.hrm.notification.repository;

import com.company.hrm.notification.domain.Notification;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

  List<Notification> findByRecipientUserIdOrderByCreatedAtDesc(
      Long recipientUserId, Pageable pageable);

  long countByRecipientUserIdAndReadFalse(Long recipientUserId);

  @Modifying
  @Query(
      "update Notification n set n.read = true where n.recipientUserId = :userId and n.read = false")
  int markAllRead(@Param("userId") Long userId);
}
