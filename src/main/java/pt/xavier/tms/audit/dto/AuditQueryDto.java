package pt.xavier.tms.audit.dto;

import java.time.LocalDate;
import java.util.UUID;
import pt.xavier.tms.shared.enums.AuditOperation;

public record AuditQueryDto(
        String entityType,
        UUID entityId,
        AuditOperation operation,
        String performedBy,
        LocalDate from,
        LocalDate to
) {
}
