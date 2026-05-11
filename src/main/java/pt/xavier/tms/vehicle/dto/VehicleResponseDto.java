package pt.xavier.tms.vehicle.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import pt.xavier.tms.shared.enums.VehicleStatus;

public record VehicleResponseDto(
        UUID id,
        String plate,
        String brand,
        String model,
        String vehicleType,
        Integer capacity,
        String activityLocation,
        LocalDate activityStartDate,
        VehicleStatus status,
        UUID currentDriverId,
        String notes,
        Instant createdAt,
        List<VehicleAccessoryDto> accessories
) {
}
