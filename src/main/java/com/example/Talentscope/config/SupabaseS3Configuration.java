
package com.example.Talentscope.config;

import java.net.URI;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.checksums.RequestChecksumCalculation;
import software.amazon.awssdk.core.checksums.ResponseChecksumValidation;
import software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
@ConditionalOnProperty(
    name = "storage.provider",
    havingValue = "supabase"
)
public class SupabaseS3Configuration {

    @Bean(destroyMethod = "close")
    public S3Client supabaseS3Client(
            @Value("${supabase.s3.endpoint}") String endpoint,
            @Value("${supabase.s3.region}") String region,
            @Value("${supabase.s3.access-key}") String accessKey,
            @Value("${supabase.s3.secret-key}") String secretKey) {

        requireValue(endpoint, "SUPABASE_S3_ENDPOINT");
        requireValue(region, "SUPABASE_S3_REGION");
        requireValue(accessKey, "SUPABASE_S3_ACCESS_KEY");
        requireValue(secretKey, "SUPABASE_S3_SECRET_KEY");

        return S3Client.builder()
                .endpointOverride(URI.create(endpoint.trim()))
                .region(Region.of(region.trim()))
                .credentialsProvider(
                    StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(
                            accessKey.trim(),
                            secretKey.trim()
                        )
                    )
                )
                .forcePathStyle(true)
                .requestChecksumCalculation(
                    RequestChecksumCalculation.WHEN_REQUIRED
                )
                .responseChecksumValidation(
                    ResponseChecksumValidation.WHEN_REQUIRED
                )
                .httpClientBuilder(UrlConnectionHttpClient.builder())
                .build();
    }

    private void requireValue(String value, String variableName) {
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(
                "Missing required configuration: " + variableName
            );
        }
    }
}
