package pt.xavier.tms.activity.service;

import jakarta.persistence.criteria.Predicate;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.xavier.tms.activity.domain.Activity;
import pt.xavier.tms.activity.domain.ActivityEvent;
import pt.xavier.tms.activity.dto.ActivityCreateDto;
import pt.xavier.tms.activity.dto.ActivityEventDto;
import pt.xavier.tms.activity.dto.ActivityResponseDto;
import pt.xavier.tms.activity.dto.ActivityUpdateDto;
import pt.xavier.tms.activity.dto.AllocationRequestDto;
import pt.xavier.tms.activity.dto.StatusTransitionDto;
import pt.xavier.tms.activity.repository.ActivityEventRepository;
import pt.xavier.tms.activity.repository.ActivityRepository;
import pt.xavier.tms.audit.annotation.Auditable;
import pt.xavier.tms.driver.repository.DriverRepository;
import pt.xavier.tms.security.SecurityUtils;
import pt.xavier.tms.shared.enums.ActivityPriority;
import pt.xavier.tms.shared.enums.ActivityStatus;
import pt.xavier.tms.shared.enums.AuditOperation;
import pt.xavier.tms.shared.exception.AllocationException;
import pt.xavier.tms.shared.exception.BusinessException;
import pt.xavier.tms.shared.exception.ResourceNotFoundException;
import pt.xavier.tms.vehicle.repository.ChecklistInspectionRepository;
import pt.xavier.tms.vehicle.repository.VehicleRepository;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final ActivityEventRepository activityEventRepository;
    private final ActivityCodeGenerator activityCodeGenerator;
    private final AllocationValidationService allocationValidationService;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final ChecklistInspectionRepository checklistInspectionRepository;

    @Transactional
    @Auditable(entityType = "ACTIVITY", operation = AuditOperation.CRIACAO)
    public ActivityResponseDto createActivity(ActivityCreateDto dto) {
        Activity activity = new Activity();
        activity.setId(UUID.randomUUID());
        activity.setCode(activityCodeGenerator.generateActivityCode());
        activity.setTitle(dto.title());
        activity.setActivityType(dto.activityType());
        activity.setLocation(dto.location());
        activity.setPlannedStart(dto.plannedStart());
        activity.setPlannedEnd(dto.plannedEnd());
        activity.setPriority(dto.priority() == null ? ActivityPriority.MEDIA : dto.priority());
        activity.setStatus(ActivityStatus.PLANEADA);
        activity.setDescription(dto.description());
        activity.setNotes(dto.notes());
        return toResponse(activityRepository.save(activity));
    }

    @Transactional
    @Auditable(entityType = "ACTIVITY", operation = AuditOperation.ATUALIZACAO)
    public ActivityResponseDto updateActivity(UUID activityId, ActivityUpdateDto dto) {
        Activity activity = getEntity(activityId);
        if (dto.title() != null) activity.setTitle(dto.title());
        if (dto.activityType() != null) activity.setActivityType(dto.activityType());
        if (dto.location() != null) activity.setLocation(dto.location());
        if (dto.plannedStart() != null) activity.setPlannedStart(dto.plannedStart());
        if (dto.plannedEnd() != null) activity.setPlannedEnd(dto.plannedEnd());
        if (dto.priority() != null) activity.setPriority(dto.priority());
        if (dto.description() != null) activity.setDescription(dto.description());
        if (dto.notes() != null) activity.setNotes(dto.notes());
        return toResponse(activityRepository.save(activity));
    }

    @Transactional
    @Auditable(entityType = "ACTIVITY", operation = AuditOperation.ELIMINACAO)
    public ActivityResponseDto deleteActivity(UUID activityId) {
        Activity activity = getEntity(activityId);
        activity.softDelete(SecurityUtils.getCurrentUserId());
        return toResponse(activityRepository.save(activity));
    }

    @Transactional(readOnly = true)
    public ActivityResponseDto getActivity(UUID activityId) {
        return toResponse(getEntity(activityId));
    }

    @Transactional(readOnly = true)
    public Page<ActivityResponseDto> listActivities(ActivityStatus status,
                                                    UUID vehicleId,
                                                    UUID driverId,
                                                    Instant from,
                                                    Instant to,
                                                    Pageable pageable) {
        return activityRepository.findAll(buildActivityFilters(status, vehicleId, driverId, from, to), pageable)
                .map(this::toResponse);
    }

    @Transactional
    @Auditable(entityType = "ACTIVITY", operation = AuditOperation.ATUALIZACAO)
    public ActivityResponseDto allocate(UUID activityId, AllocationRequestDto dto) {
        Activity activity = getEntity(activityId);
        var validationResult = allocationValidationService.validate(
                activityId,
                dto.vehicleId(),
                dto.driverId(),
                dto.plannedStart(),
                dto.plannedEnd(),
                dto.rhOverrideJustification());

        if (!validationResult.allocated()) {
            throw new AllocationException("ALLOCATION_BLOCKED", "Allocation has blocking validations", validationResult.blockers());
        }

        var vehicle = vehicleRepository.findById(dto.vehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("VEHICLE_NOT_FOUND", "Vehicle not found"));
        var driver = driverRepository.findById(dto.driverId())
                .orElseThrow(() -> new ResourceNotFoundException("DRIVER_NOT_FOUND", "Driver not found"));

        activity.setVehicle(vehicle);
        activity.setDriver(driver);
        activity.setRhOverrideJustification(dto.rhOverrideJustification());
        activity.setPlannedStart(dto.plannedStart().toInstant());
        activity.setPlannedEnd(dto.plannedEnd().toInstant());
        Activity saved = activityRepository.save(activity);

        recordEvent(saved, "ALLOCATION", null, null, "Vehicle/driver allocated");
        return toResponse(saved);
    }

    @Transactional
    @Auditable(entityType = "ACTIVITY", operation = AuditOperation.ATUALIZACAO)
    public ActivityResponseDto transitionStatus(UUID activityId, StatusTransitionDto dto) {
        Activity activity = getEntity(activityId);
        ActivityStatus previous = activity.getStatus();
        ActivityStatus target = dto.status();

        previous.validateTransition(target);
        if (previous == ActivityStatus.PLANEADA && target == ActivityStatus.EM_CURSO) {
            if (activity.getVehicle() == null) {
                throw new BusinessException("VEHICLE_NOT_ALLOCATED", "Activity must have a vehicle before starting");
            }
            checklistInspectionRepository.findTopByVehicle_IdOrderByPerformedAtDesc(activity.getVehicle().getId())
                    .filter(inspection -> inspection.hasCriticalFailures())
                    .ifPresent(inspection -> {
                        throw new BusinessException("CHECKLIST_CRITICAL_FAILURE", "Cannot start activity with critical checklist failures");
                    });
            if (activity.getActualStart() == null) {
                activity.setActualStart(Instant.now());
            }
        }
        if (target == ActivityStatus.CONCLUIDA || target == ActivityStatus.CANCELADA) {
            activity.setActualEnd(Instant.now());
        }

        activity.setStatus(target);
        Activity saved = activityRepository.save(activity);
        recordEvent(saved, "STATUS_TRANSITION", previous.name(), target.name(), dto.notes());
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ActivityEventDto> getEvents(UUID activityId) {
        getEntity(activityId);
        return activityEventRepository.findByActivityIdOrderByPerformedAtAsc(activityId)
                .stream()
                .map(this::toEventDto)
                .toList();
    }

    private Activity getEntity(UUID activityId) {
        return activityRepository.findById(activityId)
                .orElseThrow(() -> new ResourceNotFoundException("ACTIVITY_NOT_FOUND", "Activity not found"));
    }

    private Specification<Activity> buildActivityFilters(ActivityStatus status,
                                                         UUID vehicleId,
                                                         UUID driverId,
                                                         Instant from,
                                                         Instant to) {
        return (root, query, criteriaBuilder) -> {
            var predicates = new ArrayList<Predicate>();
            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }
            if (vehicleId != null) {
                predicates.add(criteriaBuilder.equal(root.get("vehicle").get("id"), vehicleId));
            }
            if (driverId != null) {
                predicates.add(criteriaBuilder.equal(root.get("driver").get("id"), driverId));
            }
            if (from != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("plannedStart"), from));
            }
            if (to != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("plannedEnd"), to));
            }
            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private void recordEvent(Activity activity, String eventType, String previousStatus, String newStatus, String notes) {
        ActivityEvent event = new ActivityEvent();
        event.setId(UUID.randomUUID());
        event.setActivity(activity);
        event.setEventType(eventType);
        event.setPreviousStatus(previousStatus);
        event.setNewStatus(newStatus);
        event.setPerformedBy(SecurityUtils.getCurrentUserId());
        event.setPerformedAt(Instant.now());
        event.setNotes(notes);
        event.setCreatedAt(Instant.now());
        event.setCreatedBy(SecurityUtils.getCurrentUserId());
        activityEventRepository.save(event);
    }

    private ActivityResponseDto toResponse(Activity activity) {
        return new ActivityResponseDto(
                activity.getId(),
                activity.getCode(),
                activity.getTitle(),
                activity.getActivityType(),
                activity.getLocation(),
                activity.getPlannedStart(),
                activity.getPlannedEnd(),
                activity.getActualStart(),
                activity.getActualEnd(),
                activity.getPriority(),
                activity.getStatus(),
                activity.getVehicle() == null ? null : activity.getVehicle().getId(),
                activity.getDriver() == null ? null : activity.getDriver().getId(),
                activity.getDescription(),
                activity.getNotes(),
                activity.getRhOverrideJustification()
        );
    }

    private ActivityEventDto toEventDto(ActivityEvent event) {
        return new ActivityEventDto(
                event.getId(),
                event.getEventType(),
                event.getPreviousStatus(),
                event.getNewStatus(),
                event.getPerformedBy(),
                event.getPerformedAt(),
                event.getNotes()
        );
    }
}
