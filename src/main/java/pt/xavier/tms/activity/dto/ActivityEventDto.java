package pt.xavier.tms.activity.dto;

import java.time.Instant;
import java.util.UUID;

public record ActivityEventDto(
        UUID id,
        String eventType,
        String previousStatus,
        String newStatus,
        String performedBy,
        Instant performedAt,
        String notes
) {
}
