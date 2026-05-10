package pt.xavier.tms.vehicle.dto;

import java.util.List;

public record VehicleConsolidatedDto(
        VehicleResponseDto vehicle,
        List<VehicleDocumentDto> documents,
        List<VehicleAccessoryDto> accessories,
        List<MaintenanceRecordDto> maintenanceRecords,
        List<ChecklistInspectionDto> checklists,
        List<ActivitySummaryDto> activeActivities,
        List<AlertSummaryDto> activeAlerts
) {
}
