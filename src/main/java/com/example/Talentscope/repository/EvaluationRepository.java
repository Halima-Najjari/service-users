package com.example.Talentscope.repository;

import com.example.Talentscope.entity.Evaluation;
import com.example.Talentscope.entity.User;
import com.example.Talentscope.entity.Evaluation.EvaluationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, UUID> {
    
    List<Evaluation> findByStagiaire(User stagiaire);
    
    List<Evaluation> findByEncadrant(User encadrant);
    
    List<Evaluation> findByEncadrantAndStagiaire(User encadrant, User stagiaire);
    
    List<Evaluation> findByStatus(EvaluationStatus status);
    
    @Query("SELECT e FROM Evaluation e JOIN e.stagiaire s WHERE s.encadrant = :encadrant")
    List<Evaluation> findByEncadrantAssignedStagiaires(@Param("encadrant") User encadrant);
    
    @Query("SELECT e FROM Evaluation e WHERE e.encadrant = :encadrant AND e.stagiaire IN :stagiaires")
    List<Evaluation> findByEncadrantAndStagiaires(@Param("encadrant") User encadrant, 
                                                  @Param("stagiaires") List<User> stagiaires);
    
    Optional<Evaluation> findByEncadrantAndStagiaireAndStatus(User encadrant, 
                                                              User stagiaire, 
                                                              EvaluationStatus status);
}
