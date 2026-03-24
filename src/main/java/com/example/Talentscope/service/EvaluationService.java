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
        User stagiaire = userRepository.findById(request.getStagiaireId())
                .orElseThrow(() -> new RuntimeException("Stagiaire non trouvé"));

        User encadrant = userRepository.findById(request.getEncadrantId())
                .orElseThrow(() -> new RuntimeException("Encadrant non trouvé"));

        // Vérifier que le stagiaire est bien assigné à cet encadrant
        if (stagiaire.getEncadrant() == null || !stagiaire.getEncadrant().getId().equals(encadrant.getId())) {
            throw new RuntimeException("Ce stagiaire n'est pas assigné à cet encadrant");
        }

        // Vérifier les permissions
        if (!canCreateEvaluation(currentUser, encadrant, stagiaire)) {
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

    public void deleteEvaluation(UUID evaluationId, User currentUser) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new RuntimeException("Évaluation non trouvée"));

        if (!canDeleteEvaluation(currentUser, evaluation)) {
            throw new RuntimeException("Permissions insuffisantes pour supprimer cette évaluation");
        }

        evaluationRepository.delete(evaluation);
    }

    private boolean canCreateEvaluation(User currentUser, User encadrant, User stagiaire) {
        // ADMIN peut créer toutes les évaluations
        if (currentUser.getRole() == com.example.Talentscope.entity.Role.ADMIN) {
            return true;
        }

        // RH peut créer toutes les évaluations
        if (currentUser.getRole() == com.example.Talentscope.entity.Role.RH) {
            return true;
        }

        // Un encadrant ne peut créer que des évaluations pour ses propres stagiaires
        if (currentUser.getRole() == com.example.Talentscope.entity.Role.ENCADRANT) {
            return currentUser.getId().equals(encadrant.getId()) && 
                   stagiaire.getEncadrant() != null && 
                   stagiaire.getEncadrant().getId().equals(currentUser.getId());
        }

        // Un stagiaire ne peut pas créer d'évaluations
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
