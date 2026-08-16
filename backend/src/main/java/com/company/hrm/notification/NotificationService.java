package com.company.hrm.notification;

import com.company.hrm.notification.domain.Notification;
import com.company.hrm.notification.domain.NotificationType;
import com.company.hrm.notification.dto.NotificationResponse;
import com.company.hrm.notification.repository.NotificationRepository;
import com.company.hrm.user.AppUser;
import com.company.hrm.user.AppUserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@Transactional
public class NotificationService {

    private static final int RECENT_LIMIT = 50;

    private final NotificationRepository notificationRepository;
    private final AppUserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               AppUserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    // ---------- Producing notifications ----------

    /** Notify a single user. No-op if userId is null. */
    public void notifyUser(Long userId, NotificationType type, String title, String message, String link) {
        if (userId == null) {
            return;
        }
        Notification n = new Notification();
        n.setRecipientUserId(userId);
        n.setType(type.name());
        n.setTitle(title);
        n.setMessage(message);
        n.setLink(link);
        notificationRepository.save(n);
    }

    /** Notify whichever account(s) are linked to an employee (may be none). */
    public void notifyEmployee(Long employeeId, NotificationType type, String title, String message, String link) {
        if (employeeId == null) {
            return;
        }
        for (AppUser u : userRepository.findByEmployeeId(employeeId)) {
            notifyUser(u.getId(), type, title, message, link);
        }
    }

    /** Notify every enabled account holding any of the given roles. */
    public void notifyRoles(Set<String> roleNames, NotificationType type, String title, String message, String link) {
        for (AppUser u : userRepository.findDistinctByEnabledTrueAndRoles_NameIn(roleNames)) {
            notifyUser(u.getId(), type, title, message, link);
        }
    }

    // ---------- Reading notifications ----------

    @Transactional(readOnly = true)
    public List<NotificationResponse> list(Long userId) {
        return notificationRepository
                .findByRecipientUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, RECENT_LIMIT))
                .stream()
                .map(NotificationService::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public long unreadCount(Long userId) {
        return notificationRepository.countByRecipientUserIdAndReadFalse(userId);
    }

    /** Mark one notification read, only if it belongs to the given user. */
    public void markRead(Long id, Long userId) {
        notificationRepository.findById(id)
                .filter(n -> n.getRecipientUserId().equals(userId))
                .ifPresent(n -> {
                    n.setRead(true);
                    notificationRepository.save(n);
                });
    }

    public void markAllRead(Long userId) {
        notificationRepository.markAllRead(userId);
    }

    private static NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
                n.getId(), n.getType(), n.getTitle(), n.getMessage(),
                n.getLink(), n.isRead(), n.getCreatedAt());
    }
}
