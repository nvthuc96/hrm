package com.company.hrm.auth.dto;

/**
 * Internal result of an auth operation: the response body (access token + identity) plus the raw
 * refresh token, which the controller places into an httpOnly cookie rather than the JSON body.
 */
public record AuthResult(AuthResponse response, String refreshToken) {}
