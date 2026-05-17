package pt.xavier.tms.driver.dto;

import java.time.LocalDate;
import java.util.UUID;
import pt.xavier.tms.shared.enums.DocumentStatus;

public record DriverDocumentDto(
        UUID id,
        String documentType,
        String documentNumber,
        LocalDate issueDate,
        LocalDate expiryDate,
        String issuingEntity,
        String category,
        DocumentStatus status,
        String notes,
        UUID fileId
) {
}
