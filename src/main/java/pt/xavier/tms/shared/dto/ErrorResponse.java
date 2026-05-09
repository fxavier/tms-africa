package pt.xavier.tms.shared.dto;

import java.util.List;

public record ErrorResponse(
        String code,
        String message,
        List<ErrorDetail> details
) {
}
