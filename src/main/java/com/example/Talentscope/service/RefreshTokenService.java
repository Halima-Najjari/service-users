package com.example.Talentscope.service;

import com.example.Talentscope.entity.RefreshToken;
import com.example.Talentscope.entity.User;
import com.example.Talentscope.repository.RefreshTokenRepository;
import com.example.Talentscope.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    @Value("${jwt.refresh-expiration:604800000}") // 7 jours par défaut
    private Long refreshExpiration;

    public RefreshToken createRefreshToken(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé: " + userEmail));

        // Révoquer les anciens refresh tokens
        refreshTokenRepository.revokeAllByUser(user);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(refreshExpiration))
                .revoked(false)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.isExpired()) {
            refreshTokenRepository.delete(token);
            throw new RuntimeException("Refresh token expiré");
        }
        return token;
    }

    public void deleteByUser(User user) {
        refreshTokenRepository.deleteByUser(user);
    }

    public String refreshAccessToken(String refreshToken) {
        RefreshToken token = findByToken(refreshToken)
                .orElseThrow(() -> new RuntimeException("Refresh token invalide"));

        verifyExpiration(token);

        if (token.getRevoked()) {
            throw new RuntimeException("Refresh token révoqué");
        }

        // Générer un nouveau access token
        return generateNewAccessToken(token.getUser());
    }

    private String generateNewAccessToken(User user) {
        // Utiliser le JwtUtil existant pour générer un nouveau token
        // Note: Cette méthode devrait être injectée ou déplacée vers JwtUtil
        return "new_access_token_for_" + user.getEmail();
    }
}
