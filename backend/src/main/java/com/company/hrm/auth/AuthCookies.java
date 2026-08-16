package com.company.hrm.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * Builds the refresh-token cookie. It is httpOnly (invisible to JS, so XSS can't
 * read it), scoped to the auth endpoints, and — via SameSite — not sent on
 * cross-site requests, which neutralises CSRF against refresh/logout.
 */
@Component
public class AuthCookies {

    public static final String REFRESH_COOKIE = "hrm_refresh";
    private static final String PATH = "/api/auth";

    private final boolean secure;
    private final String sameSite;
    private final long refreshMaxAgeSeconds;

    public AuthCookies(
            @Value("${app.auth.cookie.secure:false}") boolean secure,
            @Value("${app.auth.cookie.same-site:Strict}") String sameSite,
            @Value("${app.jwt.refresh-expiration-ms}") long refreshExpirationMs) {
        this.secure = secure;
        this.sameSite = sameSite;
        this.refreshMaxAgeSeconds = refreshExpirationMs / 1000;
    }

    public ResponseCookie build(String refreshToken) {
        return base(refreshToken)
                .maxAge(Duration.ofSeconds(refreshMaxAgeSeconds))
                .build();
    }

    /** A cookie that immediately clears the refresh cookie (logout). */
    public ResponseCookie clear() {
        return base("").maxAge(0).build();
    }

    private ResponseCookie.ResponseCookieBuilder base(String value) {
        return ResponseCookie.from(REFRESH_COOKIE, value)
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path(PATH);
    }
}
