package com.company.hrm.notification;

import com.company.hrm.me.CurrentUserService;
import com.company.hrm.notification.dto.NotificationResponse;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * The current user's own notification inbox. The recipient is always the authenticated account, so
 * an account with no linked employee (e.g. HR) still has an inbox.
 */
@RestController
@RequestMapping("/api/me/notifications")
public class NotificationController {

  private final NotificationService notificationService;
  private final CurrentUserService currentUser;

  public NotificationController(
      NotificationService notificationService, CurrentUserService currentUser) {
    this.notificationService = notificationService;
    this.currentUser = currentUser;
  }

  @GetMapping
  public List<NotificationResponse> list() {
    return notificationService.list(currentUser.requireUser().getId());
  }

  @GetMapping("/unread-count")
  public Map<String, Long> unreadCount() {
    return Map.of("count", notificationService.unreadCount(currentUser.requireUser().getId()));
  }

  @PostMapping("/{id}/read")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void markRead(@PathVariable Long id) {
    notificationService.markRead(id, currentUser.requireUser().getId());
  }

  @PostMapping("/read-all")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void markAllRead() {
    notificationService.markAllRead(currentUser.requireUser().getId());
  }
}
