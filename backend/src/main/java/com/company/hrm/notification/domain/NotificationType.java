package com.company.hrm.notification.domain;

/** Kinds of in-app notifications. Stored as a string so new types stay backward-compatible. */
public enum NotificationType {
    LEAVE_SUBMITTED,
    LEAVE_APPROVED,
    LEAVE_REJECTED
}
