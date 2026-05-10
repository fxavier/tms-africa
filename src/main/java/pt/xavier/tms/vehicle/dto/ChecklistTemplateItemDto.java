package pt.xavier.tms.vehicle.dto;

import java.util.UUID;

public record ChecklistTemplateItemDto(
        UUID id,
        String itemName,
        boolean critical,
        Integer displayOrder
) {
}
