package pt.xavier.tms.vehicle.dto;

import java.time.LocalDate;
import java.util.UUID;
import pt.xavier.tms.shared.enums.DocumentStatus;
import pt.xavier.tms.shared.enums.VehicleDocumentType;

public record VehicleDocumentDto(
        UUID id,
        VehicleDocumentType documentType,
        String documentNumber,
        LocalDate issueDate,
        LocalDate expiryDate,
        String issuingEntity,
        DocumentStatus status,
        String notes,
        UUID fileId
) {
}
