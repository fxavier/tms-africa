package pt.xavier.tms.integration.adapter;

import java.net.URI;
import java.util.Set;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import pt.xavier.tms.integration.config.FileStorageConfig;
import pt.xavier.tms.integration.dto.FileUploadResultDto;
import pt.xavier.tms.integration.port.FileStoragePort;
import pt.xavier.tms.shared.exception.BusinessException;
import pt.xavier.tms.shared.exception.ResourceNotFoundException;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Component
@ConditionalOnProperty(name = "tms.storage.type", havingValue = "s3")
public class S3FileStorageAdapter implements FileStoragePort {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("application/pdf", "image/jpeg", "image/png");

    private final FileStorageConfig config;
    private final S3Client s3Client;

    public S3FileStorageAdapter(FileStorageConfig config) {
        this.config = config;
        S3ClientBuilder builder = S3Client.builder()
                .region(Region.of(config.s3Region() == null ? "us-east-1" : config.s3Region()))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(config.s3AccessKey(), config.s3SecretKey())));

        if (config.s3Endpoint() != null && !config.s3Endpoint().isBlank()) {
            builder = builder.endpointOverride(URI.create(config.s3Endpoint()));
        }
        this.s3Client = builder.build();
    }

    @Override
    public FileUploadResultDto upload(MultipartFile file) {
        validate(file);
        String extension = extensionFor(file.getContentType());
        String storageKey = UUID.randomUUID() + extension;

        try {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(config.s3Bucket())
                    .key(storageKey)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromBytes(file.getBytes()));
        } catch (Exception e) {
            throw new BusinessException("FILE_UPLOAD_FAILED", "Failed to upload file to S3");
        }

        return new FileUploadResultDto(UUID.randomUUID(), file.getOriginalFilename(), storageKey, file.getContentType(), file.getSize());
    }

    @Override
    public Resource download(String storageKey) {
        try {
            GetObjectRequest request = GetObjectRequest.builder()
                    .bucket(config.s3Bucket())
                    .key(storageKey)
                    .build();
            ResponseBytes<GetObjectResponse> response = s3Client.getObjectAsBytes(request);
            return new ByteArrayResource(response.asByteArray());
        } catch (NoSuchKeyException e) {
            throw new ResourceNotFoundException("FILE_NOT_FOUND", "File not found");
        } catch (Exception e) {
            throw new BusinessException("FILE_DOWNLOAD_FAILED", "Failed to download file from S3");
        }
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("FILE_EMPTY", "Uploaded file is empty");
        }
        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new BusinessException("FILE_TYPE_NOT_ALLOWED", "Only PDF, JPG and PNG are allowed");
        }
        if (file.getSize() > config.maxSizeOrDefault()) {
            throw new BusinessException("FILE_TOO_LARGE", "Maximum file size is 10 MB");
        }
        if (config.s3Bucket() == null || config.s3Bucket().isBlank()) {
            throw new BusinessException("S3_BUCKET_NOT_CONFIGURED", "S3 bucket is not configured");
        }
    }

    private String extensionFor(String contentType) {
        if ("application/pdf".equals(contentType)) {
            return ".pdf";
        }
        if ("image/jpeg".equals(contentType)) {
            return ".jpg";
        }
        if ("image/png".equals(contentType)) {
            return ".png";
        }
        return "";
    }
}
