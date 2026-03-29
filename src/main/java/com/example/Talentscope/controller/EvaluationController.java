package com.example.Talentscope.controller;

import com.example.Talentscope.dto.EvaluationRequest;
import com.example.Talentscope.entity.Evaluation;
import com.example.Talentscope.entity.User;
import com.example.Talentscope.service.EvaluationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/evaluations")
@RequiredArgsConstructor
public class EvaluationController {

    private final EvaluationService evaluationService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('RH') or hasRole('ENCADRANT')")
    public ResponseEntity<Evaluation> createEvaluation(
            @Valid @RequestBody EvaluationRequest request,
            @AuthenticationPrincipal User currentUser) {
        
        try {
            System.out.println("Controller: Received evaluation creation request");
            Evaluation evaluation = evaluationService.createEvaluation(request, currentUser);
            return ResponseEntity.ok(evaluation);
        } catch (RuntimeException e) {
            System.err.println("Controller error creating evaluation: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/encadrant")
    @PreAuthorize("hasRole('ENCADRANT')")
    public ResponseEntity<List<Evaluation>> getEvaluationsForEncadrant(
            @AuthenticationPrincipal User currentUser) {
        
        List<Evaluation> evaluations = evaluationService.getEvaluationsForEncadrant(currentUser);
        return ResponseEntity.ok(evaluations);
    }

    @GetMapping("/stagiaire/{stagiaireId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RH') or hasRole('ENCADRANT') or hasRole('STAGIAIRE')")
    public ResponseEntity<List<Evaluation>> getEvaluationsForStagiaire(
            @PathVariable UUID stagiaireId,
            @AuthenticationPrincipal User currentUser) {
        
        // Récupérer le stagiaire depuis le service pour validation
        try {
            User stagiaire = User.builder().id(stagiaireId).build();
            List<Evaluation> evaluations = evaluationService.getEvaluationsForStagiaire(stagiaire, currentUser);
            return ResponseEntity.ok(evaluations);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/my-evaluations")
    @PreAuthorize("hasRole('STAGIAIRE')")
    public ResponseEntity<List<Evaluation>> getMyEvaluations(
            @AuthenticationPrincipal User currentUser) {
        
        List<Evaluation> evaluations = evaluationService.getEvaluationsForStagiaire(currentUser, currentUser);
        return ResponseEntity.ok(evaluations);
    }

    @PutMapping("/{evaluationId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RH') or hasRole('ENCADRANT')")
    public ResponseEntity<Evaluation> updateEvaluation(
            @PathVariable UUID evaluationId,
            @Valid @RequestBody EvaluationRequest request,
            @AuthenticationPrincipal User currentUser) {
        
        try {
            Evaluation evaluation = evaluationService.updateEvaluation(evaluationId, request, currentUser);
            return ResponseEntity.ok(evaluation);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{evaluationId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEvaluation(
            @PathVariable UUID evaluationId,
            @AuthenticationPrincipal User currentUser) {
        
        try {
            evaluationService.deleteEvaluation(evaluationId, currentUser);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RH')")
    public ResponseEntity<List<Evaluation>> getAllEvaluations() {
        // Pour admin/RH - implémenter si nécessaire
        return ResponseEntity.ok(List.of());
    }
}
