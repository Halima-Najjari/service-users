package com.example.Talentscope.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "evaluations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Evaluation {
    
    @Id
    @GeneratedValue
    @Column(name = "id", updatable = false, nullable = false)
    @Builder.Default
    private UUID id = UUID.randomUUID();
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stagiaire_id", nullable = false)
    @JsonIgnoreProperties({"stagiaires", "encadrant"})
    private User stagiaire;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "encadrant_id", nullable = false)
    @JsonIgnoreProperties({"stagiaires", "encadrant"})
    private User encadrant;
    
    @Column(name = "ai_score")
    private Double aiScore;
    
    @Column(name = "final_score")
    private Double finalScore;
    
    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;
    
    @Column(name = "evaluation_date", nullable = false)
    @Builder.Default
    private LocalDateTime evaluationDate = LocalDateTime.now();
    
    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private EvaluationStatus status = EvaluationStatus.EN_COURS;
    
    @Column(name = "ai_analysis", columnDefinition = "TEXT")
    private String aiAnalysis;
    
    public enum EvaluationStatus {
        EN_COURS,
        TERMINEE,
        ANNULEE
    }
}
