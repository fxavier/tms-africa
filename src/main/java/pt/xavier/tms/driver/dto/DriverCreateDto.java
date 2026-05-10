package pt.xavier.tms.driver.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;
import pt.xavier.tms.shared.enums.DriverStatus;

public record DriverCreateDto(
        @NotBlank String fullName,
        @NotBlank String phone,
        @NotBlank String address,
        @NotBlank String idNumber,
        @NotBlank String licenseNumber,
        @NotBlank String licenseCategory,
        @NotNull LocalDate licenseIssueDate,
        @NotNull LocalDate licenseExpiryDate,
        @NotBlank String activityLocation,
        DriverStatus status,
        UUID employeeId,
        String notes
) {
}
