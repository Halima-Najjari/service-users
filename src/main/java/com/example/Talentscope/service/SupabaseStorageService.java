
package com.example.Talentscope.service;

import java.io.IOException;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
@ConditionalOnProperty(
    name = "storage.provider",
    havingValue = "supabase"
)
public class SupabaseStorageService {

    private static final String STORAGE_FOLDER = "uploads/cvs/";
    private static final long MAX_FILE_SIZE = 5L * 1024 * 1024;

    private final S3Client s3Client;
    private final String bucketName;

    public SupabaseStorageService(
            S3Client s3Client,
            @Value("${supabase.s3.bucket}") String bucketName) {

        this.s3Client = s3Client;
        this.bucketName = bucketName;
    }

    // ===============================
    // Upload CV
    // ===============================

    public String storeFile(MultipartFile file, String candidateId) {

        byte[] fileBytes = validateAndReadFile(file);

        if (candidateId == null ||
                !candidateId.matches("[a-zA-Z0-9_-]+")) {
            throw new IllegalArgumentException("Invalid candidate ID");
        }

        String fileName = candidateId + "_"
                + UUID.randomUUID() + ".pdf";

        String objectKey = STORAGE_FOLDER + fileName;

        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .contentType("application/pdf")
                    .contentLength((long) fileBytes.length)
                    .build();

            s3Client.putObject(request, RequestBody.fromBytes(fileBytes));

            return objectKey;

        } catch (Exception e) {
            throw new RuntimeException("Could not upload CV to Supabase Storage", e);
        }
    }

    // ===============================
    // Download CV
    // ===============================

    public Resource loadFileAsResource(String objectKey) {

        validateObjectKey(objectKey);

        try {
            GetObjectRequest request = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .build();

            ResponseBytes<GetObjectResponse> response =
                    s3Client.getObjectAsBytes(request);

            return new ByteArrayResource(response.asByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Could not download CV from Supabase Storage", e);
        }
    }

    // ===============================
    // Delete CV
    // ===============================

    public void deleteFile(String objectKey) {

        validateObjectKey(objectKey);

        try {
            DeleteObjectRequest request = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .build();

            s3Client.deleteObject(request);

        } catch (Exception e) {
            throw new RuntimeException("Could not delete CV from Supabase Storage", e);
        }
    }

    // ===============================
    // Validation
    // ===============================

    private byte[] validateAndReadFile(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("CV file is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    "File size must be less than 5MB");
        }

        try {
            byte[] bytes = file.getBytes();

            if (bytes.length < 5 ||
                    bytes[0] != '%' ||
                    bytes[1] != 'P' ||
                    bytes[2] != 'D' ||
                    bytes[3] != 'F' ||
                    bytes[4] != '-') {

                throw new IllegalArgumentException(
                        "Only valid PDF files are allowed");
            }

            return bytes;

        } catch (IOException e) {
            throw new RuntimeException("Could not read uploaded CV", e);
        }
    }

    private void validateObjectKey(String objectKey) {

        if (objectKey == null ||
                !objectKey.startsWith(STORAGE_FOLDER) ||
                objectKey.contains("\\") ||
                objectKey.endsWith("/")) {

            throw new IllegalArgumentException("Invalid CV storage path");
        }

        for (String segment : objectKey.split("/")) {
            if (segment.equals(".") || segment.equals("..")) {
                throw new IllegalArgumentException("Invalid CV storage path");
            }
        }
    }
}
