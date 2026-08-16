package com.company.hrm.notification.domain;

import com.company.hrm.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "notification")
public class Notification extends BaseEntity {

    /** The app_user who should see this notification. */
    @Column(name = "recipient_user_id", nullable = false)
    private Long recipientUserId;

    @Column(nullable = false, length = 40)
    private String type;

    @Column(nullable = false, length = 160)
    private String title;

    @Column(length = 500)
    private String message;

    /** Optional in-app route to open when the notification is clicked. */
    @Column(length = 200)
    private String link;

    @Column(name = "is_read", nullable = false)
    private boolean read = false;
}
