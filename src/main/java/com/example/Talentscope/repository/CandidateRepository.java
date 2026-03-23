package com.example.Talentscope.repository;

import com.example.Talentscope.entity.Candidate;
import com.example.Talentscope.entity.CandidateStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, UUID> {
    
    List<Candidate> findAll();
    
    Optional<Candidate> findByEmail(String email);
    
    List<Candidate> findByStatus(CandidateStatus status);
}
