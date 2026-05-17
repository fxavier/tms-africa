package pt.xavier.tms.vehicle.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import pt.xavier.tms.shared.enums.AccessoryStatus;

public record VehicleAccessoryCreateDto(
        @NotNull @Size(max = 80) String accessoryType,
        AccessoryStatus status,
        String notes
) {
}
