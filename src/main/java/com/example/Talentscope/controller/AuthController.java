package com.example.Talentscope.controller;

import com.example.Talentscope.dto.AuthResponse;
import com.example.Talentscope.dto.LoginRequest;
import com.example.Talentscope.dto.RefreshTokenRequest;
import com.example.Talentscope.entity.RefreshToken;
import com.example.Talentscope.entity.User;
import com.example.Talentscope.repository.UserRepository;
import com.example.Talentscope.security.JwtUtil;
import com.example.Talentscope.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {
    
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest) {
      
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.email(),
                        loginRequest.password()
                )
        );
        
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        
        // Créer et retourner le refresh token
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getEmail());
        
        return ResponseEntity.ok(new AuthResponse(token, user.getEmail(), user.getRole().name(), refreshToken.getToken()));
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody RefreshTokenRequest request) {
        try {
            System.out.println("🔄 Refresh token request received: " + request.getRefreshToken());
            
            // Récupérer l'utilisateur pour les infos de la réponse
            RefreshToken refreshToken = refreshTokenService.findByToken(request.getRefreshToken())
                    .orElseThrow(() -> {
                        System.out.println("❌ Refresh token not found in database");
                        return new RuntimeException("Refresh token invalide");
                    });
            
            System.out.println("✅ Refresh token found for user: " + refreshToken.getUser().getEmail());
            
            // Verify token is not expired or revoked
            if (refreshToken.isExpired()) {
                System.out.println("❌ Refresh token expired");
                throw new RuntimeException("Refresh token expiré");
            }
            
            if (refreshToken.getRevoked()) {
                System.out.println("❌ Refresh token revoked");
                throw new RuntimeException("Refresh token révoqué");
            }
            
            User user = refreshToken.getUser();
            String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
            
            System.out.println("✅ New access token generated for: " + user.getEmail());
            
            return ResponseEntity.ok(new AuthResponse(token, user.getEmail(), user.getRole().name(), request.getRefreshToken()));
            
        } catch (RuntimeException e) {
            System.out.println("❌ Refresh token error: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Handle deprecated endpoint - redirect to correct one
    @PostMapping("/login/refresh")
    public ResponseEntity<AuthResponse> refreshTokenDeprecated(@RequestBody RefreshTokenRequest request) {
        // Log deprecation warning
        System.out.println("⚠️ Deprecated endpoint /api/auth/login/refresh used. Please use /api/auth/refresh instead.");
        return refreshToken(request);
    }
    
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody RefreshTokenRequest request) {
        try {
            RefreshToken refreshToken = refreshTokenService.findByToken(request.getRefreshToken())
                    .orElse(null);
            
            if (refreshToken != null) {
                refreshTokenService.deleteByUser(refreshToken.getUser());
            }
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
