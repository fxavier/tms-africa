package pt.xavier.tms.driver.dto;

import java.time.LocalDate;
import java.util.UUID;
import pt.xavier.tms.shared.enums.DriverStatus;

public record DriverUpdateDto(
        String fullName,
        String phone,
        String address,
        String licenseCategory,
        LocalDate licenseIssueDate,
        LocalDate licenseExpiryDate,
        String activityLocation,
        DriverStatus status,
        UUID employeeId,
        String notes
) {
}
