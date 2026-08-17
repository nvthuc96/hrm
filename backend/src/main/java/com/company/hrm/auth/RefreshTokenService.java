package com.company.hrm.auth;

import com.company.hrm.auth.domain.RefreshToken;
import com.company.hrm.auth.repository.RefreshTokenRepository;
import com.company.hrm.common.BusinessException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Issues, validates, rotates and revokes opaque refresh tokens. The raw token is returned to the
 * caller once (on issue/rotate); only its SHA-256 hash is persisted, and validation always checks
 * expiry + revocation.
 */
@Service
@Transactional
public class RefreshTokenService {

  private final RefreshTokenRepository repository;
  private final long refreshExpirationMs;
  private final SecureRandom random = new SecureRandom();

  public RefreshTokenService(
      RefreshTokenRepository repository,
      @Value("${app.jwt.refresh-expiration-ms}") long refreshExpirationMs) {
    this.repository = repository;
    this.refreshExpirationMs = refreshExpirationMs;
  }

  /** Issue a new refresh token for a user; returns the raw token (store client-side). */
  public String issue(Long userId) {
    String raw = randomToken();
    RefreshToken token = new RefreshToken();
    token.setTokenHash(sha256(raw));
    token.setUserId(userId);
    token.setExpiresAt(Instant.now().plusMillis(refreshExpirationMs));
    token.setRevoked(false);
    repository.save(token);
    return raw;
  }

  /** Validate a raw token and return the owning user id, or throw if invalid. */
  public Long verify(String rawToken) {
    return requireValid(rawToken).getUserId();
  }

  /**
   * Rotate: validate the presented token, revoke it, and issue a fresh one for the same user.
   * Returns the new raw token. Rotation limits the window in which a stolen refresh token is
   * usable.
   */
  public Rotated rotate(String rawToken) {
    RefreshToken current = requireValid(rawToken);
    current.setRevoked(true);
    repository.save(current);
    String next = issue(current.getUserId());
    return new Rotated(current.getUserId(), next);
  }

  /** Revoke a single token (server-side logout). Idempotent. */
  public void revoke(String rawToken) {
    if (rawToken == null || rawToken.isBlank()) {
      return;
    }
    repository
        .findByTokenHash(sha256(rawToken))
        .ifPresent(
            t -> {
              t.setRevoked(true);
              repository.save(t);
            });
  }

  /** Revoke every active token for a user (e.g. "log out everywhere"). */
  public void revokeAllForUser(Long userId) {
    repository.revokeAllForUser(userId);
  }

  private RefreshToken requireValid(String rawToken) {
    if (rawToken == null || rawToken.isBlank()) {
      throw new BusinessException("Thiếu refresh token");
    }
    RefreshToken token =
        repository
            .findByTokenHash(sha256(rawToken))
            .orElseThrow(() -> new BusinessException("Refresh token không hợp lệ"));
    if (token.isRevoked()) {
      throw new BusinessException("Refresh token đã bị thu hồi");
    }
    if (token.getExpiresAt().isBefore(Instant.now())) {
      throw new BusinessException("Refresh token đã hết hạn");
    }
    return token;
  }

  private String randomToken() {
    byte[] bytes = new byte[32];
    random.nextBytes(bytes);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
  }

  private static String sha256(String value) {
    try {
      MessageDigest md = MessageDigest.getInstance("SHA-256");
      return HexFormat.of().formatHex(md.digest(value.getBytes(StandardCharsets.UTF_8)));
    } catch (Exception e) {
      throw new IllegalStateException("SHA-256 unavailable", e);
    }
  }

  public record Rotated(Long userId, String refreshToken) {}
}
