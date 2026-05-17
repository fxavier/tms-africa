package pt.xavier.tms.vehicle.dto;

import java.time.Instant;
import java.util.UUID;
import pt.xavier.tms.shared.enums.AccessoryStatus;

public record VehicleAccessoryDto(
        UUID id,
        String accessoryType,
        AccessoryStatus status,
        Instant lastCheckedAt,
        String lastCheckedBy,
        String notes
) {
}
