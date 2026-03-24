package com.example.Talentscope.controller;

import com.example.Talentscope.dto.CreateUserRequest;
import com.example.Talentscope.entity.User;
import com.example.Talentscope.entity.Role;
import com.example.Talentscope.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@Valid @RequestBody CreateUserRequest request) {
        try {
            User user = userService.createUser(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('RH')")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RH')")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable Role role) {
        List<User> users = userService.getUsersByRole(role);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/encadrants-disponibles")
    @PreAuthorize("hasRole('RH')")
    public ResponseEntity<List<User>> getAvailableEncadrants() {
        List<User> encadrants = userService.getAvailableEncadrants();
        return ResponseEntity.ok(encadrants);
    }

    @PostMapping("/assign-stagiaire")
    @PreAuthorize("hasRole('RH')")
    public ResponseEntity<?> assignStagiaireToEncadrant(
            @RequestParam UUID stagiaireId,
            @RequestParam UUID encadrantId) {
        
        try {
            User updatedStagiaire = userService.assignStagiaireToEncadrant(stagiaireId, encadrantId);
            return ResponseEntity.ok(updatedStagiaire);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID userId) {
        try {
            userService.deleteUser(userId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
