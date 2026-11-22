package com.example.Talentscope.dto;

public record AuthResponse(
    String token,
    String type,
    String email,
    String role,
    String refreshToken
) {
    public AuthResponse(String token, String email, String role) {
        this(token, "Bearer", email, role, null);
    }
    
    public AuthResponse(String token, String email, String role, String refreshToken) {
        this(token, "Bearer", email, role, refreshToken);
    }
}
