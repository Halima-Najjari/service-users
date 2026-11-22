package com.example.Talentscope.service;

import com.example.Talentscope.dto.CreateUserRequest;
import com.example.Talentscope.entity.User;
import com.example.Talentscope.entity.Role;
import com.example.Talentscope.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email déjà utilisé");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        if (request.getEncadrantId() != null && request.getRole() == Role.STAGIAIRE) {
            User encadrant = userRepository.findById(request.getEncadrantId())
                    .orElseThrow(() -> new RuntimeException("Encadrant non trouvé"));
            user.setEncadrant(encadrant);
        }

        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }

    public List<User> getAvailableEncadrants() {
        return userRepository.findByRoleAndEncadrantIsNull(Role.ENCADRANT);
    }

    public User assignStagiaireToEncadrant(UUID stagiaireId, UUID encadrantId) {
        User stagiaire = userRepository.findById(stagiaireId)
                .orElseThrow(() -> new RuntimeException("Stagiaire non trouvé"));
        
        User encadrant = userRepository.findById(encadrantId)
                .orElseThrow(() -> new RuntimeException("Encadrant non trouvé"));

        if (stagiaire.getRole() != Role.STAGIAIRE) {
            throw new RuntimeException("L'utilisateur n'est pas un stagiaire");
        }

        if (encadrant.getRole() != Role.ENCADRANT) {
            throw new RuntimeException("L'utilisateur n'est pas un encadrant");
        }

        stagiaire.setEncadrant(encadrant);
        return userRepository.save(stagiaire);
    }

    public void deleteUser(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("Utilisateur non trouvé");
        }
        userRepository.deleteById(userId);
    }
}
