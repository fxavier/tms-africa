package pt.xavier.tms.vehicle.dto;

import java.util.UUID;
import pt.xavier.tms.shared.enums.ChecklistItemStatus;

public record ChecklistInspectionItemDto(
        UUID templateItemId,
        String itemName,
        boolean critical,
        ChecklistItemStatus status,
        String notes
) {
}
