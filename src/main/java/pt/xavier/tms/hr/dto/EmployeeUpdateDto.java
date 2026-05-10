package pt.xavier.tms.hr.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import pt.xavier.tms.shared.enums.EmployeeStatus;

public record EmployeeUpdateDto(
        String fullName,
        String phone,
        String email,
        String idNumber,
        UUID functionId,
        EmployeeStatus status,
        LocalDate hireDate,
        LocalDate terminationDate,
        BigDecimal baseSalary,
        String currency,
        String notes
) {
}
