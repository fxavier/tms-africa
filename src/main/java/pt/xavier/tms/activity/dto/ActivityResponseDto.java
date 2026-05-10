package pt.xavier.tms.activity.dto;

import java.time.Instant;
import java.util.UUID;
import pt.xavier.tms.shared.enums.ActivityPriority;
import pt.xavier.tms.shared.enums.ActivityStatus;

public record ActivityResponseDto(
        UUID id,
        String code,
        String title,
        String activityType,
        String location,
        Instant plannedStart,
        Instant plannedEnd,
        Instant actualStart,
        Instant actualEnd,
        ActivityPriority priority,
        ActivityStatus status,
        UUID vehicleId,
        UUID driverId,
        String description,
        String notes,
        String rhOverrideJustification
) {
}
