package pt.xavier.tms.vehicle.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ChecklistInspectionDto(
        UUID id,
        UUID activityId,
        UUID templateId,
        String performedBy,
        Instant performedAt,
        String notes,
        List<ChecklistInspectionItemDto> items,
        boolean criticalFailures
) {
}
