package pt.xavier.tms.vehicle.dto;

import jakarta.validation.constraints.NotNull;
import pt.xavier.tms.shared.enums.AccessoryStatus;
import pt.xavier.tms.shared.enums.AccessoryType;

public record VehicleAccessoryCreateDto(
        @NotNull AccessoryType accessoryType,
        AccessoryStatus status,
        String notes
) {
}
