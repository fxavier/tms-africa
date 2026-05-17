package pt.xavier.tms.integration.adapter;

import java.net.URI;
import java.io.IOException;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import pt.xavier.tms.integration.config.FileStorageConfig;
import pt.xavier.tms.integration.dto.FileUploadResultDto;
import pt.xavier.tms.integration.port.FileStoragePort;
import pt.xavier.tms.security.SecurityUtils;
import pt.xavier.tms.shared.exception.BusinessException;
import pt.xavier.tms.shared.exception.ResourceNotFoundException;
import pt.xavier.tms.vehicle.domain.FileRecord;
import pt.xavier.tms.vehicle.repository.FileRecordRepository;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.exception.SdkClientException;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

@Component
@ConditionalOnProperty(name = "tms.storage.type", havingValue = "s3")
public class S3FileStorageAdapter implements FileStoragePort {

    private static final Logger log = LoggerFactory.getLogger(S3FileStorageAdapter.class);
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("application/pdf", "image/jpeg", "image/png");
    private static final String DEFAULT_REGION = "eu-west-1";

    private final FileStorageConfig config;
    private final FileRecordRepository fileRecordRepository;
    private final S3Client s3Client;

    public S3FileStorageAdapter(FileStorageConfig config, FileRecordRepository fileRecordRepository) {
        this.config = config;
        this.fileRecordRepository = fileRecordRepository;
        S3ClientBuilder builder = S3Client.builder()
                .region(Region.of(configuredRegion()))
                .credentialsProvider(credentialsProvider());

        if (config.s3Endpoint() != null && !config.s3Endpoint().isBlank()) {
            builder = builder.endpointOverride(URI.create(config.s3Endpoint()));
        }
        this.s3Client = builder.build();
    }

    @Override
    public FileUploadResultDto upload(MultipartFile file) {
        validate(file);
        String extension = extensionFor(file.getContentType());
        String storageKey = storageKey(extension);

        try {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(config.s3Bucket())
                    .key(storageKey)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromBytes(file.getBytes()));
        } catch (S3Exception e) {
            throw toUploadException(e);
        } catch (SdkClientException e) {
            log.warn("S3 upload client failure for bucket={}, region={}: {}", config.s3Bucket(), configuredRegion(), e.getMessage());
            throw new BusinessException("S3_CLIENT_ERROR", "Unable to connect to AWS S3 or resolve AWS credentials");
        } catch (IOException e) {
            log.warn("Unable to read uploaded file before S3 upload: {}", e.getMessage());
            throw new BusinessException("FILE_READ_FAILED", "Unable to read uploaded file");
        } catch (Exception e) {
            log.warn("Unexpected S3 upload failure for bucket={}, region={}", config.s3Bucket(), configuredRegion(), e);
            throw new BusinessException("FILE_UPLOAD_FAILED", "Failed to upload file to S3");
        }

        FileRecord record = saveFileRecord(file, storageKey);
        return new FileUploadResultDto(record.getId(), record.getOriginalFilename(), record.getStorageKey(), record.getContentType(), record.getSizeBytes());
    }

    @Override
    public Resource download(String storageKey) {
        validateS3Configuration();
        try {
            GetObjectRequest request = GetObjectRequest.builder()
                    .bucket(config.s3Bucket())
                    .key(storageKey)
                    .build();
            ResponseBytes<GetObjectResponse> response = s3Client.getObjectAsBytes(request);
            return new ByteArrayResource(response.asByteArray());
        } catch (NoSuchKeyException e) {
            throw new ResourceNotFoundException("FILE_NOT_FOUND", "File not found");
        } catch (S3Exception e) {
            throw toDownloadException(e);
        } catch (SdkClientException e) {
            log.warn("S3 download client failure for bucket={}, region={}: {}", config.s3Bucket(), configuredRegion(), e.getMessage());
            throw new BusinessException("S3_CLIENT_ERROR", "Unable to connect to AWS S3 or resolve AWS credentials");
        } catch (Exception e) {
            log.warn("Unexpected S3 download failure for bucket={}, region={}", config.s3Bucket(), configuredRegion(), e);
            throw new BusinessException("FILE_DOWNLOAD_FAILED", "Failed to download file from S3");
        }
    }

    private void validate(MultipartFile file) {
        validateS3Configuration();
        if (file == null || file.isEmpty()) {
            throw new BusinessException("FILE_EMPTY", "Uploaded file is empty");
        }
        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new BusinessException("FILE_TYPE_NOT_ALLOWED", "Only PDF, JPG and PNG are allowed");
        }
        if (file.getSize() > config.maxSizeOrDefault()) {
            throw new BusinessException("FILE_TOO_LARGE", "Maximum file size is 10 MB");
        }
    }

    private void validateS3Configuration() {
        if (isBlank(config.s3Bucket())) {
            throw new BusinessException("S3_BUCKET_NOT_CONFIGURED", "S3 bucket is not configured");
        }
        if (isBlank(config.s3AccessKey()) != isBlank(config.s3SecretKey())) {
            throw new BusinessException("S3_CREDENTIALS_INCOMPLETE", "S3 access key and secret key must be configured together");
        }
    }

    private AwsCredentialsProvider credentialsProvider() {
        if (!isBlank(config.s3AccessKey()) && !isBlank(config.s3SecretKey())) {
            return StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(config.s3AccessKey(), config.s3SecretKey()));
        }
        return DefaultCredentialsProvider.create();
    }

    private String configuredRegion() {
        return isBlank(config.s3Region()) ? DEFAULT_REGION : config.s3Region();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
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

    private String storageKey(String extension) {
        return configuredPrefix() + UUID.randomUUID() + extension;
    }

    private String configuredPrefix() {
        if (isBlank(config.s3Prefix())) {
            return "";
        }
        String prefix = config.s3Prefix().trim();
        while (prefix.startsWith("/")) {
            prefix = prefix.substring(1);
        }
        return prefix.endsWith("/") ? prefix : prefix + "/";
    }

    private BusinessException toUploadException(S3Exception e) {
        String awsCode = awsErrorCode(e);
        log.warn("S3 upload failed for bucket={}, region={}, awsCode={}, status={}: {}",
                config.s3Bucket(), configuredRegion(), awsCode, e.statusCode(), awsErrorMessage(e));
        return switch (awsCode) {
            case "AccessDenied" -> new BusinessException("S3_ACCESS_DENIED", "AWS denied access to upload files to this S3 bucket");
            case "NoSuchBucket" -> new BusinessException("S3_BUCKET_NOT_FOUND", "Configured S3 bucket does not exist");
            case "InvalidAccessKeyId", "SignatureDoesNotMatch" ->
                    new BusinessException("S3_INVALID_CREDENTIALS", "AWS S3 credentials are invalid");
            case "AuthorizationHeaderMalformed", "PermanentRedirect" ->
                    new BusinessException("S3_REGION_MISMATCH", "Configured S3 region does not match the bucket region");
            default -> new BusinessException("FILE_UPLOAD_FAILED", "Failed to upload file to S3: " + awsCode);
        };
    }

    private BusinessException toDownloadException(S3Exception e) {
        String awsCode = awsErrorCode(e);
        log.warn("S3 download failed for bucket={}, region={}, awsCode={}, status={}: {}",
                config.s3Bucket(), configuredRegion(), awsCode, e.statusCode(), awsErrorMessage(e));
        return switch (awsCode) {
            case "AccessDenied" -> new BusinessException("S3_ACCESS_DENIED", "AWS denied access to download files from this S3 bucket");
            case "NoSuchBucket" -> new BusinessException("S3_BUCKET_NOT_FOUND", "Configured S3 bucket does not exist");
            case "InvalidAccessKeyId", "SignatureDoesNotMatch" ->
                    new BusinessException("S3_INVALID_CREDENTIALS", "AWS S3 credentials are invalid");
            case "AuthorizationHeaderMalformed", "PermanentRedirect" ->
                    new BusinessException("S3_REGION_MISMATCH", "Configured S3 region does not match the bucket region");
            default -> new BusinessException("FILE_DOWNLOAD_FAILED", "Failed to download file from S3: " + awsCode);
        };
    }

    private String awsErrorCode(S3Exception e) {
        if (e.awsErrorDetails() == null || isBlank(e.awsErrorDetails().errorCode())) {
            return "UNKNOWN";
        }
        return e.awsErrorDetails().errorCode();
    }

    private String awsErrorMessage(S3Exception e) {
        if (e.awsErrorDetails() == null || isBlank(e.awsErrorDetails().errorMessage())) {
            return e.getMessage();
        }
        return e.awsErrorDetails().errorMessage();
    }

    private FileRecord saveFileRecord(MultipartFile file, String storageKey) {
        FileRecord record = new FileRecord();
        record.setId(UUID.randomUUID());
        record.setOriginalFilename(file.getOriginalFilename() == null ? storageKey : file.getOriginalFilename());
        record.setStorageKey(storageKey);
        record.setContentType(file.getContentType());
        record.setSizeBytes(file.getSize());
        record.setUploadedBy(SecurityUtils.getCurrentUserId());
        record.setUploadedAt(Instant.now());
        return fileRecordRepository.save(record);
    }
}
