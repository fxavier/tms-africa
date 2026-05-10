package pt.xavier.tms.activity.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AllocationRequestDto(
        UUID vehicleId,
        UUID driverId,
        OffsetDateTime plannedStart,
        OffsetDateTime plannedEnd,
        String rhOverrideJustification
) {
}
