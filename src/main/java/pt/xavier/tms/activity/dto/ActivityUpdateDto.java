package pt.xavier.tms.activity.dto;

import java.time.Instant;
import pt.xavier.tms.shared.enums.ActivityPriority;

public record ActivityUpdateDto(
        String title,
        String activityType,
        String location,
        Instant plannedStart,
        Instant plannedEnd,
        ActivityPriority priority,
        String description,
        String notes
) {
}
