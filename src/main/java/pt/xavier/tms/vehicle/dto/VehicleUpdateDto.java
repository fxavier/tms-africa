package pt.xavier.tms.vehicle.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record VehicleUpdateDto(
        @NotBlank String brand,
        @NotBlank String model,
        @NotBlank String vehicleType,
        @NotNull Integer capacity,
        @NotBlank String activityLocation,
        @NotNull LocalDate activityStartDate,
        String notes
) {
}
