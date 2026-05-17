package pt.xavier.tms.integration.adapter;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
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

@Component
@ConditionalOnProperty(name = "tms.storage.type", havingValue = "local", matchIfMissing = true)
public class LocalFileStorageAdapter implements FileStoragePort {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("application/pdf", "image/jpeg", "image/png");

    private final FileStorageConfig config;
    private final FileRecordRepository fileRecordRepository;
    private final Path basePath;

    public LocalFileStorageAdapter(FileStorageConfig config, FileRecordRepository fileRecordRepository) {
        this.config = config;
        this.fileRecordRepository = fileRecordRepository;
        String configuredPath = config.localBasePath() == null || config.localBasePath().isBlank()
                ? "./.tms-storage"
                : config.localBasePath();
        this.basePath = Path.of(configuredPath).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.basePath);
        } catch (IOException e) {
            throw new IllegalStateException("Could not initialize local storage path", e);
        }
    }

    @Override
    public FileUploadResultDto upload(MultipartFile file) {
        validate(file);
        String extension = extensionFor(file.getContentType());
        String storageKey = UUID.randomUUID() + extension;
        Path destination = basePath.resolve(storageKey);
        try {
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new BusinessException("FILE_UPLOAD_FAILED", "Failed to upload file");
        }
        FileRecord record = saveFileRecord(file, storageKey);
        return new FileUploadResultDto(record.getId(), record.getOriginalFilename(), record.getStorageKey(), record.getContentType(), record.getSizeBytes());
    }

    @Override
    public Resource download(String storageKey) {
        try {
            Path filePath = basePath.resolve(storageKey).normalize();
            if (!filePath.startsWith(basePath) || !Files.exists(filePath)) {
                throw new ResourceNotFoundException("FILE_NOT_FOUND", "File not found");
            }
            return new UrlResource(filePath.toUri());
        } catch (IOException e) {
            throw new ResourceNotFoundException("FILE_NOT_FOUND", "File not found");
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
