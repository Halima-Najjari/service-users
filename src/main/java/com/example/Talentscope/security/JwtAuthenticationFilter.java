package com.example.Talentscope.security;

import com.example.Talentscope.entity.User;
import com.example.Talentscope.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    
   @Override
    protected void doFilterInternal(HttpServletRequest request,
                                HttpServletResponse response,
                                FilterChain filterChain)
        throws ServletException, IOException {

    String path = request.getServletPath();
    System.out.println("🔍 JWT Filter - Path: " + path);

    // ✅ Skip auth endpoints - NO JWT required for login, register, and refresh
    if (path.startsWith("/api/auth")) {
        System.out.println("✅ JWT Filter - Skipping auth endpoint: " + path);
        filterChain.doFilter(request, response);
        return;
    }

    // 🔐 For all other endpoints, JWT is required
    String token = getTokenFromRequest(request);
    System.out.println("🔑 JWT Filter - Token: " + (token != null ? "Present" : "Missing"));

    if (StringUtils.hasText(token) && jwtUtil.validateToken(token)) {
        String email = jwtUtil.extractEmail(token);
        System.out.println("📧 JWT Filter - Email extracted: " + email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        System.out.println("✅ JWT Filter - User loaded: " + user.getEmail());

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());

        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        System.out.println("🔐 JWT Filter - Authentication set in context");
    } else {
        System.out.println("❌ JWT Filter - Token validation failed or missing");
        // Ne pas bloquer ici, laisser Spring Security gérer l'accès refusé
    }

    filterChain.doFilter(request, response);
}
    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        
        return null;
    }
    
}
