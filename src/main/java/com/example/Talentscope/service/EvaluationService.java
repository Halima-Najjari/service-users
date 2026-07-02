package com.example.Talentscope.service;

import com.example.Talentscope.dto.EvaluationRequest;
import com.example.Talentscope.entity.Evaluation;
import com.example.Talentscope.entity.User;
import com.example.Talentscope.entity.Evaluation.EvaluationStatus;
import com.example.Talentscope.repository.EvaluationRepository;
import com.example.Talentscope.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final UserRepository userRepository;

    public Evaluation createEvaluation(EvaluationRequest request, User currentUser) {
        System.out.println("Creating evaluation with request: " + request);
        System.out.println("Current user: " + currentUser.getEmail() + " (ID: " + currentUser.getId() + ")");
        
        User stagiaire = userRepository.findByIdWithEncadrant(request.getStagiaireId())
                .orElseThrow(() -> {
                    System.err.println("Stagiaire non trouvé avec ID: " + request.getStagiaireId());
                    return new RuntimeException("Stagiaire non trouvé");
                });

        User encadrant = userRepository.findById(request.getEncadrantId())
                .orElseThrow(() -> {
                    System.err.println("Encadrant non trouvé avec ID: " + request.getEncadrantId());
                    return new RuntimeException("Encadrant non trouvé");
                });

        System.out.println("Found stagiaire: " + stagiaire.getEmail() + " (ID: " + stagiaire.getId() + ")");
        System.out.println("Found encadrant: " + encadrant.getEmail() + " (ID: " + encadrant.getId() + ")");
        System.out.println("Stagiaire's encadrant: " + (stagiaire.getEncadrant() != null ? stagiaire.getEncadrant().getEmail() : "NULL"));

        // Vérifier que le stagiaire est bien assigné à cet encadrant
        if (stagiaire.getEncadrant() == null || !stagiaire.getEncadrant().getId().equals(encadrant.getId())) {
            System.err.println("Ce stagiaire n'est pas assigné à cet encadrant");
            throw new RuntimeException("Ce stagiaire n'est pas assigné à cet encadrant");
        }

        // Vérifier les permissions
        if (!canCreateEvaluation(currentUser, encadrant, stagiaire)) {
            System.err.println("Permissions insuffisantes pour créer cette évaluation");
            throw new RuntimeException("Permissions insuffisantes pour créer cette évaluation");
        }

        Evaluation evaluation = Evaluation.builder()
                .stagiaire(stagiaire)
                .encadrant(encadrant)
                .aiScore(request.getAiScore())
                .finalScore(request.getFinalScore())
                .comments(request.getComments())
                .aiAnalysis(request.getAiAnalysis())
                .status(request.getStatus() != null ? request.getStatus() : EvaluationStatus.EN_COURS)
                .build();

        return evaluationRepository.save(evaluation);
    }

    public List<Evaluation> getEvaluationsForEncadrant(User encadrant) {
        // Un encadrant ne voit que les évaluations de ses stagiaires assignés
        return evaluationRepository.findByEncadrantAssignedStagiaires(encadrant);
    }

    public List<Evaluation> getEvaluationsForStagiaire(User stagiaire, User currentUser) {
        // Un stagiaire ne voit que ses propres évaluations
        // Un encadrant ne voit que les évaluations de ses stagiaires
        // Un admin/RH voit toutes les évaluations du stagiaire
        
        if (currentUser.getRole() == com.example.Talentscope.entity.Role.STAGIAIRE) {
            if (!currentUser.getId().equals(stagiaire.getId())) {
                throw new RuntimeException("Un stagiaire ne peut voir que ses propres évaluations");
            }
        } else if (currentUser.getRole() == com.example.Talentscope.entity.Role.ENCADRANT) {
            // Vérifier que le stagiaire est assigné à cet encadrant
            if (stagiaire.getEncadrant() == null || !stagiaire.getEncadrant().getId().equals(currentUser.getId())) {
                throw new RuntimeException("Cet encadrant n'est pas assigné à ce stagiaire");
            }
        }
        // ADMIN et RH peuvent voir toutes les évaluations

        return evaluationRepository.findByStagiaire(stagiaire);
    }

    public Evaluation updateEvaluation(UUID evaluationId, EvaluationRequest request, User currentUser) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new RuntimeException("Évaluation non trouvée"));

        if (!canUpdateEvaluation(currentUser, evaluation)) {
            throw new RuntimeException("Permissions insuffisantes pour modifier cette évaluation");
        }

        if (request.getAiScore() != null) {
            evaluation.setAiScore(request.getAiScore());
        }
        if (request.getFinalScore() != null) {
            evaluation.setFinalScore(request.getFinalScore());
        }
        if (request.getComments() != null) {
            evaluation.setComments(request.getComments());
        }
        if (request.getAiAnalysis() != null) {
            evaluation.setAiAnalysis(request.getAiAnalysis());
        }
        if (request.getStatus() != null) {
            evaluation.setStatus(request.getStatus());
        }

        return evaluationRepository.save(evaluation);
    }

    public List<Evaluation> getAllEvaluations() {
        return evaluationRepository.findAll();
    }

    public void deleteEvaluation(UUID evaluationId, User currentUser) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new RuntimeException("Évaluation non trouvée"));

        if (!canDeleteEvaluation(currentUser, evaluation)) {
            throw new RuntimeException("Permissions insuffisantes pour supprimer cette évaluation");
        }

        evaluationRepository.delete(evaluation);
    }

    private boolean canCreateEvaluation(User currentUser, User encadrant, User stagiaire) {
        System.out.println("Checking permissions for user: " + currentUser.getEmail() + " with role: " + currentUser.getRole());
        System.out.println("Target encadrant: " + encadrant.getEmail() + " (ID: " + encadrant.getId() + ")");
        System.out.println("Target stagiaire: " + stagiaire.getEmail() + " (ID: " + stagiaire.getId() + ")");
        System.out.println("Current user ID: " + currentUser.getId());
        System.out.println("Stagiaire's encadrant: " + (stagiaire.getEncadrant() != null ? stagiaire.getEncadrant().getEmail() + " (ID: " + stagiaire.getEncadrant().getId() + ")" : "NULL"));
        
        // ADMIN peut créer toutes les évaluations
        if (currentUser.getRole() == com.example.Talentscope.entity.Role.ADMIN) {
            System.out.println("Permission granted: User is ADMIN");
            return true;
        }

        // RH peut créer toutes les évaluations
        if (currentUser.getRole() == com.example.Talentscope.entity.Role.RH) {
            System.out.println("Permission granted: User is RH");
            return true;
        }

        // Un encadrant ne peut créer que des évaluations pour ses propres stagiaires
        if (currentUser.getRole() == com.example.Talentscope.entity.Role.ENCADRANT) {
            boolean sameEncadrant = currentUser.getId().equals(encadrant.getId());
            boolean hasEncadrantAssigned = stagiaire.getEncadrant() != null;
            boolean assignedToCurrentUser = hasEncadrantAssigned && stagiaire.getEncadrant().getId().equals(currentUser.getId());
            
            System.out.println("Permission check for ENCADRANT:");
            System.out.println("  - Same encadrant: " + sameEncadrant);
            System.out.println("  - Stagiaire has encadrant assigned: " + hasEncadrantAssigned);
            System.out.println("  - Assigned to current user: " + assignedToCurrentUser);
            System.out.println("  - Final result: " + (sameEncadrant && hasEncadrantAssigned && assignedToCurrentUser));
            
            return sameEncadrant && hasEncadrantAssigned && assignedToCurrentUser;
        }

        // Un stagiaire ne peut pas créer d'évaluations
        System.out.println("Permission denied: User is STAGIAIRE or unknown role");
        return false;
    }

    private boolean canUpdateEvaluation(User currentUser, Evaluation evaluation) {
        // ADMIN peut modifier toutes les évaluations
        if (currentUser.getRole() == com.example.Talentscope.entity.Role.ADMIN) {
            return true;
        }

        // RH peut modifier toutes les évaluations
        if (currentUser.getRole() == com.example.Talentscope.entity.Role.RH) {
            return true;
        }

        // Un encadrant ne peut modifier que ses propres évaluations
        if (currentUser.getRole() == com.example.Talentscope.entity.Role.ENCADRANT) {
            return currentUser.getId().equals(evaluation.getEncadrant().getId());
        }

        return false;
    }

    private boolean canDeleteEvaluation(User currentUser, Evaluation evaluation) {
        // Seul ADMIN peut supprimer des évaluations
        return currentUser.getRole() == com.example.Talentscope.entity.Role.ADMIN;
    }
}
