package pt.xavier.tms.activity.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import pt.xavier.tms.activity.domain.Activity;
import pt.xavier.tms.activity.dto.AllocationResultDto;
import pt.xavier.tms.activity.repository.ActivityRepository;
import pt.xavier.tms.driver.domain.Driver;
import pt.xavier.tms.driver.domain.DriverDocument;
import pt.xavier.tms.driver.repository.DriverDocumentRepository;
import pt.xavier.tms.driver.repository.DriverRepository;
import pt.xavier.tms.integration.dto.DriverAvailabilityDto;
import pt.xavier.tms.integration.exception.RhIntegrationException;
import pt.xavier.tms.integration.port.DriverAvailabilityPort;
import pt.xavier.tms.shared.enums.DocumentStatus;
import pt.xavier.tms.shared.enums.DriverDocumentType;
import pt.xavier.tms.shared.enums.DriverStatus;
import pt.xavier.tms.shared.enums.VehicleStatus;
import pt.xavier.tms.vehicle.domain.ChecklistInspection;
import pt.xavier.tms.vehicle.domain.Vehicle;
import pt.xavier.tms.vehicle.domain.VehicleDocument;
import pt.xavier.tms.vehicle.repository.ChecklistInspectionRepository;
import pt.xavier.tms.vehicle.repository.VehicleDocumentRepository;
import pt.xavier.tms.vehicle.repository.VehicleRepository;

@ExtendWith(MockitoExtension.class)
class AllocationValidationServiceTest {

    @Mock private ActivityRepository activityRepository;
    @Mock private VehicleRepository vehicleRepository;
    @Mock private VehicleDocumentRepository vehicleDocumentRepository;
    @Mock private ChecklistInspectionRepository checklistInspectionRepository;
    @Mock private DriverRepository driverRepository;
    @Mock private DriverDocumentRepository driverDocumentRepository;
    @Mock private DriverAvailabilityPort driverAvailabilityPort;
    @Mock private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private AllocationValidationService service;

    private UUID activityId;
    private UUID vehicleId;
    private UUID driverId;
    private OffsetDateTime start;
    private OffsetDateTime end;

    @BeforeEach
    void setUp() {
        activityId = UUID.randomUUID();
        vehicleId = UUID.randomUUID();
        driverId = UUID.randomUUID();
        start = OffsetDateTime.now().plusDays(1);
        end = start.plusHours(2);

        Vehicle vehicle = new Vehicle();
        vehicle.setId(vehicleId);
        vehicle.setStatus(VehicleStatus.DISPONIVEL);
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(vehicle));

        Driver driver = new Driver();
        driver.setId(driverId);
        driver.setStatus(DriverStatus.ATIVO);
        when(driverRepository.findById(driverId)).thenReturn(Optional.of(driver));

        when(vehicleDocumentRepository.findByVehicleIdAndStatus(vehicleId, DocumentStatus.EXPIRADO)).thenReturn(List.of());
        when(checklistInspectionRepository.findTopByVehicleIdOrderByPerformedAtDesc(vehicleId)).thenReturn(Optional.empty());
        when(driverDocumentRepository.findByDriverIdAndDocumentType(driverId, DriverDocumentType.CARTA_CONDUCAO)).thenReturn(List.of());
        when(driverAvailabilityPort.checkAvailability(any(), any(), any()))
                .thenReturn(new DriverAvailabilityDto(driverId, true, "AVAILABLE", List.of()));
        when(activityRepository.findConflictingActivitiesForVehicle(any(), any(), any(), any())).thenReturn(List.of());
        when(activityRepository.findConflictingActivitiesForDriver(any(), any(), any(), any())).thenReturn(List.of());
    }

    @Test
    void shouldBlockWhenVehicleInMaintenance() {
        when(vehicleRepository.findById(vehicleId)).thenAnswer(inv -> {
            Vehicle v = new Vehicle();
            v.setId(vehicleId);
            v.setStatus(VehicleStatus.EM_MANUTENCAO);
            return Optional.of(v);
        });

        AllocationResultDto result = service.validate(activityId, vehicleId, driverId, start, end, null);

        assertThat(result.allocated()).isFalse();
        assertThat(result.blockers()).contains("VEHICLE_IN_MAINTENANCE");
    }

    @Test
    void shouldBlockWhenVehicleIsDecommissioned() {
        when(vehicleRepository.findById(vehicleId)).thenAnswer(inv -> {
            Vehicle v = new Vehicle();
            v.setId(vehicleId);
            v.setStatus(VehicleStatus.ABATIDA);
            return Optional.of(v);
        });

        AllocationResultDto result = service.validate(activityId, vehicleId, driverId, start, end, null);

        assertThat(result.blockers()).contains("VEHICLE_DECOMMISSIONED");
    }

    @Test
    void shouldBlockWhenVehicleDocumentExpired() {
        VehicleDocument doc = new VehicleDocument();
        doc.setId(UUID.randomUUID());
        doc.setStatus(DocumentStatus.EXPIRADO);
        when(vehicleDocumentRepository.findByVehicleIdAndStatus(vehicleId, DocumentStatus.EXPIRADO)).thenReturn(List.of(doc));

        AllocationResultDto result = service.validate(activityId, vehicleId, driverId, start, end, null);

        assertThat(result.blockers()).anyMatch(b -> b.startsWith("VEHICLE_DOCUMENT_EXPIRED:"));
    }

    @Test
    void shouldBlockWhenChecklistHasCriticalFailure() {
        ChecklistInspection inspection = new ChecklistInspection();
        var item = new pt.xavier.tms.vehicle.domain.ChecklistInspectionItem();
        item.setCritical(true);
        item.setStatus(pt.xavier.tms.shared.enums.ChecklistItemStatus.AVARIA);
        inspection.setItems(List.of(item));
        when(checklistInspectionRepository.findTopByVehicleIdOrderByPerformedAtDesc(vehicleId)).thenReturn(Optional.of(inspection));

        AllocationResultDto result = service.validate(activityId, vehicleId, driverId, start, end, null);

        assertThat(result.blockers()).contains("CHECKLIST_CRITICAL_FAILURE");
    }

    @Test
    void shouldBlockWhenDriverSuspended() {
        when(driverRepository.findById(driverId)).thenAnswer(inv -> {
            Driver d = new Driver();
            d.setId(driverId);
            d.setStatus(DriverStatus.SUSPENSO);
            return Optional.of(d);
        });

        AllocationResultDto result = service.validate(activityId, vehicleId, driverId, start, end, null);

        assertThat(result.blockers()).contains("DRIVER_SUSPENDED");
    }

    @Test
    void shouldBlockWhenDriverLicenseExpired() {
        DriverDocument doc = new DriverDocument();
        doc.setId(UUID.randomUUID());
        doc.setStatus(DocumentStatus.EXPIRADO);
        when(driverDocumentRepository.findByDriverIdAndDocumentType(driverId, DriverDocumentType.CARTA_CONDUCAO))
                .thenReturn(List.of(doc));

        AllocationResultDto result = service.validate(activityId, vehicleId, driverId, start, end, null);

        assertThat(result.blockers()).anyMatch(b -> b.startsWith("DRIVER_LICENSE_EXPIRED:"));
    }

    @Test
    void shouldBlockWhenRhUnavailableWithoutJustification() {
        when(driverAvailabilityPort.checkAvailability(any(), any(), any()))
                .thenReturn(new DriverAvailabilityDto(driverId, false, "ABSENT", List.of()));

        AllocationResultDto result = service.validate(activityId, vehicleId, driverId, start, end, null);

        assertThat(result.blockers()).contains("DRIVER_RH_UNAVAILABLE");
    }

    @Test
    void shouldBlockWhenRhThrowsWithoutJustification() {
        when(driverAvailabilityPort.checkAvailability(any(), any(), any()))
                .thenThrow(new RhIntegrationException("RH down"));

        AllocationResultDto result = service.validate(activityId, vehicleId, driverId, start, end, null);

        assertThat(result.blockers()).contains("RH_SYSTEM_UNAVAILABLE");
    }

    @Test
    void shouldNotBlockWhenRhThrowsWithJustification() {
        when(driverAvailabilityPort.checkAvailability(any(), any(), any()))
                .thenThrow(new RhIntegrationException("RH down"));

        AllocationResultDto result = service.validate(activityId, vehicleId, driverId, start, end, "manual override");

        assertThat(result.allocated()).isTrue();
        assertThat(result.blockers()).isEmpty();
    }

    @Test
    void shouldBlockWhenVehicleHasConflict() {
        Activity conflict = new Activity();
        conflict.setId(UUID.randomUUID());
        conflict.setCode("ACT-2026-0009");
        conflict.setPlannedStart(Instant.now());
        conflict.setPlannedEnd(Instant.now().plusSeconds(3600));
        when(activityRepository.findConflictingActivitiesForVehicle(any(), any(), any(), any())).thenReturn(List.of(conflict));

        AllocationResultDto result = service.validate(activityId, vehicleId, driverId, start, end, null);

        assertThat(result.blockers()).anyMatch(b -> b.startsWith("VEHICLE_ALLOCATION_CONFLICT:"));
    }

    @Test
    void shouldBlockWhenDriverHasConflict() {
        Activity conflict = new Activity();
        conflict.setId(UUID.randomUUID());
        conflict.setCode("ACT-2026-0010");
        when(activityRepository.findConflictingActivitiesForDriver(any(), any(), any(), any())).thenReturn(List.of(conflict));

        AllocationResultDto result = service.validate(activityId, vehicleId, driverId, start, end, null);

        assertThat(result.blockers()).anyMatch(b -> b.startsWith("DRIVER_ALLOCATION_CONFLICT:"));
    }

    @Test
    void shouldReturnAllocatedWhenNoBlockers() {
        AllocationResultDto result = service.validate(activityId, vehicleId, driverId, start, end, null);

        assertThat(result.allocated()).isTrue();
        assertThat(result.blockers()).isEmpty();
    }
}
