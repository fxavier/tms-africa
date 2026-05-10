package pt.xavier.tms.hr.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import pt.xavier.tms.shared.enums.PaymentMethod;

public record SalaryPaymentCreateDto(
        @NotNull UUID employeeId,
        @NotNull Integer periodYear,
        @NotNull Integer periodMonth,
        @NotNull BigDecimal grossAmount,
        @NotNull BigDecimal netAmount,
        @NotNull BigDecimal paidAmount,
        String currency,
        @NotNull LocalDate paymentDate,
        @NotNull PaymentMethod paymentMethod,
        String reference,
        String notes
) {
}
