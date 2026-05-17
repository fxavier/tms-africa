package pt.xavier.tms.integration.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "tms.storage")
public record FileStorageConfig(
        String type,
        String localBasePath,
        Long maxFileSizeBytes,
        String s3Bucket,
        String s3Region,
        String s3Endpoint,
        String s3Prefix,
        String s3AccessKey,
        String s3SecretKey
) {
    public long maxSizeOrDefault() {
        return maxFileSizeBytes == null ? 10 * 1024 * 1024L : maxFileSizeBytes;
    }
}
