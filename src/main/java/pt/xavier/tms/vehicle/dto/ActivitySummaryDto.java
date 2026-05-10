package pt.xavier.tms.vehicle.dto;

import java.time.Instant;
import java.util.UUID;

public record ActivitySummaryDto(
        UUID id,
        String code,
        String title,
        String status,
        Instant plannedStart,
        Instant plannedEnd
) {
}
