package pt.xavier.tms.vehicle.dto;

import java.time.LocalDate;
import java.util.UUID;
import pt.xavier.tms.shared.enums.DocumentStatus;

public record VehicleDocumentDto(
        UUID id,
        String documentType,
        String documentNumber,
        LocalDate issueDate,
        LocalDate expiryDate,
        String issuingEntity,
        DocumentStatus status,
        String notes,
        UUID fileId
) {
}
