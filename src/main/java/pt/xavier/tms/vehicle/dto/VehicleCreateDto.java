package pt.xavier.tms.vehicle.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record VehicleCreateDto(
        @NotBlank String plate,
        @NotBlank String brand,
        @NotBlank String model,
        @NotBlank String vehicleType,
        @NotNull Integer capacity,
        @NotBlank String activityLocation,
        @NotNull LocalDate activityStartDate,
        String notes,
        List<VehicleAccessoryCreateDto> accessories
) {
}
