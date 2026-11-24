
package com.example.Talentscope.service;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final long MAX_FILE_SIZE = 5L * 1024 * 1024;

    private final ObjectProvider<SupabaseStorageService> supabaseProvider;

    @Value("${storage.provider:local}")
    private String storageProvider;

    @Value("${storage.location:uploads/cvs}")
    private String storageLocation;

    public FileStorageService(
            ObjectProvider<SupabaseStorageService> supabaseProvider) {
        this.supabaseProvider = supabaseProvider;
    }

    // ===============================
    // Upload CV
    // ===============================

    public String storeFile(MultipartFile file, String candidateId) {

        validateFile(file);

        if (candidateId == null ||
                !candidateId.matches("[a-zA-Z0-9_-]+")) {
            throw new IllegalArgumentException("Invalid candidate ID");
        }

        // Production: Supabase Storage
        if (isSupabaseEnabled()) {
            return getSupabaseService().storeFile(file, candidateId);
        }

        // Local: filesystem storage
        String fileName = candidateId + "_"
                + UUID.randomUUID() + ".pdf";

        Path uploadRoot = getUploadRoot();

        try {
            Files.createDirectories(uploadRoot);

            Path targetLocation = uploadRoot.resolve(fileName).normalize();

            if (!targetLocation.startsWith(uploadRoot)) {
                throw new IllegalArgumentException("Invalid file path");
            }

            try (InputStream inputStream = file.getInputStream()) {
               Files.copy(inputStream, targetLocation);
            }

            return getStorageKey(fileName);

        } catch (IOException e) {
            throw new RuntimeException("Could not store CV locally", e);
        }
    }

    // ===============================
    // Download CV
    // ===============================

    public Resource loadFileAsResource(String filePath) {

        if (filePath == null || filePath.isBlank()) {
            throw new IllegalArgumentException("CV path is empty");
        }

        // Production: Supabase Storage
        if (isSupabaseEnabled()) {
            return getSupabaseService().loadFileAsResource(filePath);
        }

        // Local: filesystem storage
        try {
            Path targetPath = resolveLocalFile(filePath);

            Resource resource = new UrlResource(targetPath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                throw new FileNotFoundException("CV file not found");
            }

            return resource;

        } catch (IOException e) {
            throw new RuntimeException("Could not load CV locally", e);
        }
    }

    // ===============================
    // Delete CV
    // ===============================

    public void deleteFile(String filePath) {

        if (filePath == null || filePath.isBlank()) {
            return;
        }

        // Production: Supabase Storage
        if (isSupabaseEnabled()) {
            getSupabaseService().deleteFile(filePath);
            return;
        }

        // Local: filesystem storage
        try {
            Path targetPath = resolveLocalFile(filePath);
            Files.deleteIfExists(targetPath);

        } catch (IOException e) {
            throw new RuntimeException("Could not delete local CV", e);
        }
    }

    // ===============================
    // Validation
    // ===============================

    private void validateFile(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("CV file is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                "File size must be less than 5MB"
            );
        }

        try (InputStream inputStream = file.getInputStream()) {

            byte[] header = inputStream.readNBytes(5);

            boolean isPdf = header.length == 5
                    && header[0] == '%'
                    && header[1] == 'P'
                    && header[2] == 'D'
                    && header[3] == 'F'
                    && header[4] == '-';

            if (!isPdf) {
                throw new IllegalArgumentException(
                    "Only valid PDF files are allowed"
                );
            }

        } catch (IOException e) {
            throw new RuntimeException("Could not validate CV file", e);
        }
    }

    // ===============================
    // Storage helpers
    // ===============================

    private boolean isSupabaseEnabled() {
        return "supabase".equalsIgnoreCase(storageProvider.trim());
    }

    private SupabaseStorageService getSupabaseService() {

        SupabaseStorageService service = supabaseProvider.getIfAvailable();

        if (service == null) {
            throw new IllegalStateException(
                "Supabase Storage is enabled but SupabaseStorageService is unavailable"
            );
        }

        return service;
    }

    private Path getUploadRoot() {
        return Paths.get(storageLocation)
                .toAbsolutePath()
                .normalize();
    }

    private Path resolveLocalFile(String filePath) {

        Path uploadRoot = getUploadRoot();
        Path targetPath = Paths.get(filePath);

        if (!targetPath.isAbsolute()) {
            targetPath = Paths.get("")
                    .toAbsolutePath()
                    .resolve(targetPath);
        }

        targetPath = targetPath.normalize();

        if (!targetPath.startsWith(uploadRoot)) {
            throw new IllegalArgumentException(
                "CV path is outside the configured storage directory"
            );
        }

        return targetPath;
    }

    private String getStorageKey(String fileName) {

        String folder = storageLocation
                .replace("\\", "/")
                .replaceAll("/+$", "");

        return folder + "/" + fileName;
    }
}
