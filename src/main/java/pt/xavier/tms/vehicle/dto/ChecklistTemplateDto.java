package pt.xavier.tms.vehicle.dto;

import java.util.List;
import java.util.UUID;

public record ChecklistTemplateDto(
        UUID id,
        String vehicleType,
        String name,
        boolean active,
        List<ChecklistTemplateItemDto> items
) {
}
