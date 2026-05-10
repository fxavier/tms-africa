package pt.xavier.tms.vehicle.event;

import java.time.LocalDate;
import java.util.UUID;

public record MaintenanceRegisteredEvent(UUID vehicleId, UUID maintenanceId, LocalDate nextMaintenanceDate) {
}
