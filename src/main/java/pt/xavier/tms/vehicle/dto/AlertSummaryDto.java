package pt.xavier.tms.vehicle.dto;

import java.time.Instant;
import java.util.UUID;

public record AlertSummaryDto(
        UUID id,
        String alertType,
        String severity,
        String title,
        String message,
        Instant createdAt
) {
}
