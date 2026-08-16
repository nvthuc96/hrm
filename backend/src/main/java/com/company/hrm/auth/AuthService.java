package com.company.hrm.auth;

import com.company.hrm.auth.dto.AuthResponse;
import com.company.hrm.auth.dto.AuthResult;
import com.company.hrm.auth.dto.LoginRequest;
import com.company.hrm.common.BusinessException;
import com.company.hrm.config.JwtService;
import com.company.hrm.user.AppUser;
import com.company.hrm.user.AppUserRepository;
import com.company.hrm.user.Role;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final AppUserRepository userRepository;

    public AuthService(AuthenticationManager authenticationManager,
                       JwtService jwtService,
                       RefreshTokenService refreshTokenService,
                       AppUserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.userRepository = userRepository;
    }

    public AuthResult login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password()));

        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        AppUser user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new BusinessException("Không tìm thấy tài khoản"));

        String accessToken = jwtService.generateToken(request.username(), roles);
        String refreshToken = refreshTokenService.issue(user.getId());
        return new AuthResult(new AuthResponse(accessToken, request.username(), roles), refreshToken);
    }

    /** Exchange a valid refresh token for a new access token (rotating the refresh token). */
    public AuthResult refresh(String rawRefreshToken) {
        RefreshTokenService.Rotated rotated = refreshTokenService.rotate(rawRefreshToken);

        AppUser user = userRepository.findById(rotated.userId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy tài khoản"));
        if (!user.isEnabled()) {
            throw new BusinessException("Tài khoản đã bị khóa");
        }

        List<String> roles = user.getRoles().stream().map(Role::getName).sorted().toList();
        String accessToken = jwtService.generateToken(user.getUsername(), roles);
        return new AuthResult(new AuthResponse(accessToken, user.getUsername(), roles), rotated.refreshToken());
    }

    /** Server-side logout: revoke the presented refresh token. */
    public void logout(String rawRefreshToken) {
        refreshTokenService.revoke(rawRefreshToken);
    }
}
