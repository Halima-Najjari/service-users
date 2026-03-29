package com.example.Talentscope.dto;

import com.example.Talentscope.entity.Evaluation.EvaluationStatus;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class EvaluationRequest {
    
    @NotNull(message = "L'ID du stagiaire est obligatoire")
    private UUID stagiaireId;
    
    @NotNull(message = "L'ID de l'encadrant est obligatoire")
    private UUID encadrantId;
    
    @DecimalMin(value = "0.0", message = "Le score IA doit être entre 0 et 20")
    @DecimalMax(value = "20.0", message = "Le score IA doit être entre 0 et 20")
    private Double aiScore;
    
    @DecimalMin(value = "0.0", message = "Le score final doit être entre 0 et 20")
    @DecimalMax(value = "20.0", message = "Le score final doit être entre 0 et 20")
    private Double finalScore;
    
    private String comments;
    
    private String aiAnalysis;
    
    private EvaluationStatus status;
}
