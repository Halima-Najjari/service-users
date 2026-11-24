package com.example.Talentscope.controller;

import com.example.Talentscope.dto.CandidateUpdateRequest;
import com.example.Talentscope.entity.Candidate;
import com.example.Talentscope.entity.CandidateStatus;
import com.example.Talentscope.repository.CandidateRepository;
import com.example.Talentscope.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

import java.util.UUID;

@RestController
@RequestMapping("/api/candidates")
@RequiredArgsConstructor
public class CandidateController {
    
    private final CandidateRepository candidateRepository;
    private final FileStorageService fileStorageService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Candidate>> getAllCandidates() {
        List<Candidate> candidates = candidateRepository.findAll();
        return ResponseEntity.ok(candidates);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Candidate> getCandidateById(@PathVariable UUID id) {
        return candidateRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Candidate>> getCandidatesByStatus(@PathVariable String status) {
        try {
            CandidateStatus candidateStatus = CandidateStatus.valueOf(status.toUpperCase());
            List<Candidate> candidates = candidateRepository.findByStatus(candidateStatus);
            return ResponseEntity.ok(candidates);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Candidate> createCandidate(@RequestBody Candidate candidate) {
        Candidate savedCandidate = candidateRepository.save(candidate);
        return ResponseEntity.ok(savedCandidate);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Candidate> updateCandidate(@PathVariable UUID id, @RequestBody Candidate candidate) {
        if (!candidateRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        candidate.setId(id);
        Candidate updatedCandidate = candidateRepository.save(candidate);
        return ResponseEntity.ok(updatedCandidate);
    }
    
    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Candidate> partialUpdateCandidate(@PathVariable UUID id, @RequestBody CandidateUpdateRequest request) {
        return candidateRepository.findById(id)
                .map(existingCandidate -> {
                    // Mise à jour seulement les champs non nuls
                    if (request.getFirstName() != null) {
                        existingCandidate.setFirstName(request.getFirstName());
                    }
                    if (request.getLastName() != null) {
                        existingCandidate.setLastName(request.getLastName());
                    }
                    if (request.getEmail() != null) {
                        existingCandidate.setEmail(request.getEmail());
                    }
                    if (request.getPhone() != null) {
                        existingCandidate.setPhone(request.getPhone());
                    }
                    if (request.getStatus() != null) {
                        existingCandidate.setStatus(request.getStatus());
                    }
                    
                    Candidate updatedCandidate = candidateRepository.save(existingCandidate);
                    return ResponseEntity.ok(updatedCandidate);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCandidate(@PathVariable UUID id) {
        if (!candidateRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        // Récupérer le candidat pour supprimer son CV
        Candidate candidate = candidateRepository.findById(id).orElse(null);
        if (candidate != null && candidate.getCvPath() != null) {
            try {
                fileStorageService.deleteFile(candidate.getCvPath());
            } catch (Exception e) {
                // Logger l'erreur mais continuer la suppression
                System.err.println("Could not delete CV file: " + e.getMessage());
            }
        }
        
        candidateRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    
   
@PostMapping("/{id}/upload-cv")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<String> uploadCv(
        @PathVariable UUID id,
        @RequestParam("file") MultipartFile file) {

    Optional<Candidate> candidateOpt = candidateRepository.findById(id);

    if (candidateOpt.isEmpty()) {
        return ResponseEntity.notFound().build();
    }

    Candidate candidate = candidateOpt.get();
    String previousCvPath = candidate.getCvPath();
    String newCvPath = null;

    try {
        // Upload the new CV
        newCvPath = fileStorageService.storeFile(file, id.toString());

        // Save the new storage path
        candidate.setCvPath(newCvPath);
        candidateRepository.save(candidate);

    } catch (RuntimeException e) {

        // Clean up the new file if database update fails
        if (newCvPath != null) {
            try {
                fileStorageService.deleteFile(newCvPath);
            } catch (Exception cleanupException) {
                System.err.println(
                    "Could not clean up new CV: "
                    + cleanupException.getMessage()
                );
            }
        }

        System.err.println("CV upload failed: " + e.getMessage());

        return ResponseEntity.badRequest()
                .body("Upload failed: " + e.getMessage());
    }

    // Delete previous CV only after successful upload and database update
    if (previousCvPath != null &&
            !previousCvPath.equals(newCvPath)) {
        try {
            fileStorageService.deleteFile(previousCvPath);
        } catch (Exception e) {
            System.err.println(
                "Could not delete previous CV: " + e.getMessage()
            );
        }
    }

    return ResponseEntity.ok(
            "CV uploaded successfully: " + newCvPath
    );
}

  
@GetMapping("/{id}/cv")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<Resource> downloadCv(@PathVariable UUID id) {

    Optional<Candidate> candidateOpt = candidateRepository.findById(id);

    if (candidateOpt.isEmpty()) {
        return ResponseEntity.notFound().build();
    }

    Candidate candidate = candidateOpt.get();

    if (candidate.getCvPath() == null ||
            candidate.getCvPath().isBlank()) {
        return ResponseEntity.notFound().build();
    }

    try {
        Resource resource =
                fileStorageService.loadFileAsResource(candidate.getCvPath());

        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }

        String filename = "cv_"
                + candidate.getFirstName() + "_"
                + candidate.getLastName() + ".pdf";

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                    HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=\"" + filename + "\""
                )
                .body(resource);

    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.internalServerError().build();
    }
}
}
