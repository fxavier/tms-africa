package pt.xavier.tms.integration.dto;

import java.util.UUID;

public record FileUploadResultDto(
        UUID fileId,
        String originalFilename,
        String storageKey,
        String contentType,
        long sizeBytes
) {
}
