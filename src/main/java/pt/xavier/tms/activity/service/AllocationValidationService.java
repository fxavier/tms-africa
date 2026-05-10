package pt.xavier.tms.activity.service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.xavier.tms.activity.dto.AllocationResultDto;
import pt.xavier.tms.activity.repository.ActivityRepository;
import pt.xavier.tms.audit.event.AuditEvent;
import pt.xavier.tms.driver.repository.DriverDocumentRepository;
import pt.xavier.tms.driver.repository.DriverRepository;
import pt.xavier.tms.integration.exception.RhIntegrationException;
import pt.xavier.tms.integration.port.DriverAvailabilityPort;
import pt.xavier.tms.security.SecurityUtils;
import pt.xavier.tms.shared.enums.AuditOperation;
import pt.xavier.tms.shared.enums.DocumentStatus;
import pt.xavier.tms.shared.enums.DriverDocumentType;
import pt.xavier.tms.shared.enums.DriverStatus;
import pt.xavier.tms.shared.enums.VehicleStatus;
import pt.xavier.tms.shared.exception.ResourceNotFoundException;
import pt.xavier.tms.vehicle.repository.ChecklistInspectionRepository;
import pt.xavier.tms.vehicle.repository.VehicleDocumentRepository;
import pt.xavier.tms.vehicle.repository.VehicleRepository;

@Service
@RequiredArgsConstructor
public class AllocationValidationService {

    private final ActivityRepository activityRepository;
    private final VehicleRepository vehicleRepository;
    private final VehicleDocumentRepository vehicleDocumentRepository;
    private final ChecklistInspectionRepository checklistInspectionRepository;
    private final DriverRepository driverRepository;
    private final DriverDocumentRepository driverDocumentRepository;
    private final DriverAvailabilityPort driverAvailabilityPort;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public AllocationResultDto validate(UUID activityId,
                                        UUID vehicleId,
                                        UUID driverId,
                                        OffsetDateTime plannedStart,
                                        OffsetDateTime plannedEnd,
                                        String rhOverrideJustification) {
        var blockers = new ArrayList<String>();

        var vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("VEHICLE_NOT_FOUND", "Vehicle not found"));
        var driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("DRIVER_NOT_FOUND", "Driver not found"));

        if (vehicle.getStatus() == VehicleStatus.EM_MANUTENCAO) {
            blockers.add("VEHICLE_IN_MAINTENANCE");
        }
        if (vehicle.getStatus() == VehicleStatus.INDISPONIVEL) {
            blockers.add("VEHICLE_UNAVAILABLE");
        }
        if (vehicle.getStatus() == VehicleStatus.ABATIDA) {
            blockers.add("VEHICLE_DECOMMISSIONED");
        }

        vehicleDocumentRepository.findByVehicleIdAndStatus(vehicleId, DocumentStatus.EXPIRADO)
                .forEach(document -> blockers.add("VEHICLE_DOCUMENT_EXPIRED:%s".formatted(document.getId())));

        checklistInspectionRepository.findTopByVehicleIdOrderByPerformedAtDesc(vehicleId)
                .filter(inspection -> inspection.hasCriticalFailures())
                .ifPresent(inspection -> blockers.add("CHECKLIST_CRITICAL_FAILURE"));

        if (driver.getStatus() == DriverStatus.INATIVO) {
            blockers.add("DRIVER_INACTIVE");
        }
        if (driver.getStatus() == DriverStatus.SUSPENSO) {
            blockers.add("DRIVER_SUSPENDED");
        }

        driverDocumentRepository.findByDriverIdAndDocumentType(driverId, DriverDocumentType.CARTA_CONDUCAO)
                .stream()
                .filter(document -> document.getStatus() == DocumentStatus.EXPIRADO)
                .forEach(document -> blockers.add("DRIVER_LICENSE_EXPIRED:%s".formatted(document.getId())));

        try {
            var availability = driverAvailabilityPort.checkAvailability(
                    driverId,
                    plannedStart.toLocalDate(),
                    plannedEnd.toLocalDate());
            if (!availability.available()) {
                if (hasOverride(rhOverrideJustification)) {
                    publishRhOverrideAudit(activityId, driverId, rhOverrideJustification, availability.reason());
                } else {
                    blockers.add("DRIVER_RH_UNAVAILABLE");
                }
            }
        } catch (RhIntegrationException ex) {
            if (hasOverride(rhOverrideJustification)) {
                publishRhOverrideAudit(activityId, driverId, rhOverrideJustification, "RH_SYSTEM_UNAVAILABLE");
            } else {
                blockers.add("RH_SYSTEM_UNAVAILABLE");
            }
        }

        activityRepository.findConflictingActivitiesForVehicle(
                        vehicleId,
                        plannedStart.toInstant(),
                        plannedEnd.toInstant(),
                        activityId)
                .forEach(conflict -> blockers.add("VEHICLE_ALLOCATION_CONFLICT:%s".formatted(conflict.getCode())));

        activityRepository.findConflictingActivitiesForDriver(
                        driverId,
                        plannedStart.toInstant(),
                        plannedEnd.toInstant(),
                        activityId)
                .forEach(conflict -> blockers.add("DRIVER_ALLOCATION_CONFLICT:%s".formatted(conflict.getCode())));

        return new AllocationResultDto(blockers.isEmpty(), List.copyOf(blockers));
    }

    private boolean hasOverride(String rhOverrideJustification) {
        return rhOverrideJustification != null && !rhOverrideJustification.isBlank();
    }

    private void publishRhOverrideAudit(UUID activityId, UUID driverId, String justification, String rhReason) {
        eventPublisher.publishEvent(AuditEvent.of(
                "ACTIVITY",
                activityId,
                AuditOperation.ATUALIZACAO,
                SecurityUtils.getCurrentUserId(),
                SecurityUtils.getCurrentIpAddress(),
                Map.of(),
                Map.of(
                        "event", "RH_OVERRIDE",
                        "driverId", driverId,
                        "reason", rhReason,
                        "justification", justification
                )
        ));
    }
}
