package pt.xavier.tms.activity.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pt.xavier.tms.activity.domain.Activity;
import pt.xavier.tms.activity.dto.StatusTransitionDto;
import pt.xavier.tms.activity.repository.ActivityEventRepository;
import pt.xavier.tms.activity.repository.ActivityRepository;
import pt.xavier.tms.driver.repository.DriverRepository;
import pt.xavier.tms.shared.enums.ActivityPriority;
import pt.xavier.tms.shared.enums.ActivityStatus;
import pt.xavier.tms.shared.exception.BusinessException;
import pt.xavier.tms.vehicle.domain.Vehicle;
import pt.xavier.tms.vehicle.repository.ChecklistInspectionRepository;
import pt.xavier.tms.vehicle.repository.VehicleRepository;

@ExtendWith(MockitoExtension.class)
class ActivityServiceTest {

    @Mock private ActivityRepository activityRepository;
    @Mock private ActivityEventRepository activityEventRepository;
    @Mock private ActivityCodeGenerator activityCodeGenerator;
    @Mock private AllocationValidationService allocationValidationService;
    @Mock private VehicleRepository vehicleRepository;
    @Mock private DriverRepository driverRepository;
    @Mock private ChecklistInspectionRepository checklistInspectionRepository;

    @InjectMocks
    private ActivityService activityService;

    private UUID activityId;

    @BeforeEach
    void setUp() {
        activityId = UUID.randomUUID();
    }

    @Test
    void transitionPlaneadaToEmCursoShouldSetActualStart() {
        Activity activity = baseActivity(ActivityStatus.PLANEADA);
        Vehicle vehicle = new Vehicle();
        vehicle.setId(UUID.randomUUID());
        activity.setVehicle(vehicle);
        when(activityRepository.save(any(Activity.class))).thenAnswer(inv -> inv.getArgument(0));
        when(activityEventRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(activityRepository.findById(activityId)).thenReturn(Optional.of(activity));
        when(checklistInspectionRepository.findTopByVehicle_IdOrderByPerformedAtDesc(any())).thenReturn(Optional.empty());

        var response = activityService.transitionStatus(activityId, new StatusTransitionDto(ActivityStatus.EM_CURSO, "start"));

        assertThat(response.status()).isEqualTo(ActivityStatus.EM_CURSO);
        assertThat(response.actualStart()).isNotNull();
    }

    @Test
    void transitionEmCursoToConcluidaShouldSetActualEnd() {
        Activity activity = baseActivity(ActivityStatus.EM_CURSO);
        activity.setActualStart(Instant.now().minusSeconds(3600));
        when(activityRepository.save(any(Activity.class))).thenAnswer(inv -> inv.getArgument(0));
        when(activityEventRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(activityRepository.findById(activityId)).thenReturn(Optional.of(activity));

        var response = activityService.transitionStatus(activityId, new StatusTransitionDto(ActivityStatus.CONCLUIDA, "done"));

        assertThat(response.status()).isEqualTo(ActivityStatus.CONCLUIDA);
        assertThat(response.actualEnd()).isNotNull();
    }

    @Test
    void transitionConcluidaToEmCursoShouldThrowBusinessException() {
        Activity activity = baseActivity(ActivityStatus.CONCLUIDA);
        when(activityRepository.findById(activityId)).thenReturn(Optional.of(activity));

        assertThatThrownBy(() -> activityService.transitionStatus(activityId, new StatusTransitionDto(ActivityStatus.EM_CURSO, null)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Invalid transition");
    }

    @Test
    void transitionCanceladaToPlaneadaShouldThrowBusinessException() {
        Activity activity = baseActivity(ActivityStatus.CANCELADA);
        when(activityRepository.findById(activityId)).thenReturn(Optional.of(activity));

        assertThatThrownBy(() -> activityService.transitionStatus(activityId, new StatusTransitionDto(ActivityStatus.PLANEADA, null)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Invalid transition");
    }

    private Activity baseActivity(ActivityStatus status) {
        Activity activity = new Activity();
        activity.setId(activityId);
        activity.setCode("ACT-2026-0001");
        activity.setTitle("A1");
        activity.setActivityType("Entrega");
        activity.setLocation("Maputo");
        activity.setPlannedStart(Instant.now().plusSeconds(3600));
        activity.setPlannedEnd(Instant.now().plusSeconds(7200));
        activity.setPriority(ActivityPriority.MEDIA);
        activity.setStatus(status);
        return activity;
    }
}
