package pt.xavier.tms.integration.dto;

import java.time.LocalDate;

public record EmployeeAbsenceDto(
        LocalDate startDate,
        LocalDate endDate,
        String reason
) {
}
