package com.example.Talentscope.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

@Service
@Slf4j
public class PDFTextExtractionService {

    private final Tika tika = new Tika();

    public String extractTextFromPDF(MultipartFile file) throws IOException {
        if (!file.getContentType().equals("application/pdf")) {
            throw new IllegalArgumentException("Le fichier doit être un PDF");
        }

        try (InputStream inputStream = file.getInputStream()) {
            String extractedText = tika.parseToString(inputStream);
            
            log.info("Texte extrait du PDF {} - {} caractères", 
                    file.getOriginalFilename(), extractedText.length());
            
            return extractedText;
        } catch (Exception e) {
            log.error("Erreur lors de l'extraction du texte du PDF: {}", e.getMessage());
            throw new RuntimeException("Impossible d'extraire le texte du PDF: " + e.getMessage());
        }
    }

    public String extractTextFromPDFPath(String filePath) throws IOException {
        try {
            String extractedText = tika.parseToString(new java.io.File(filePath));
            
            log.info("Texte extrait du fichier {} - {} caractères", 
                    filePath, extractedText.length());
            
            return extractedText;
        } catch (Exception e) {
            log.error("Erreur lors de l'extraction du texte du fichier {}: {}", 
                    filePath, e.getMessage());
            throw new RuntimeException("Impossible d'extraire le texte du PDF: " + e.getMessage());
        }
    }

    public boolean isPDF(MultipartFile file) {
        return file.getContentType() != null && 
               file.getContentType().equals("application/pdf");
    }
}
