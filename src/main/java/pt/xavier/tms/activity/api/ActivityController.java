package pt.xavier.tms.activity.api;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pt.xavier.tms.activity.dto.ActivityCreateDto;
import pt.xavier.tms.activity.dto.ActivityEventDto;
import pt.xavier.tms.activity.dto.ActivityResponseDto;
import pt.xavier.tms.activity.dto.ActivityUpdateDto;
import pt.xavier.tms.activity.dto.AllocationRequestDto;
import pt.xavier.tms.activity.dto.StatusTransitionDto;
import pt.xavier.tms.activity.service.ActivityService;
import pt.xavier.tms.shared.dto.ApiResponse;
import pt.xavier.tms.shared.dto.PagedResponse;
import pt.xavier.tms.shared.enums.ActivityStatus;

@Validated
@RestController
@RequestMapping("/api/v1/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR_FROTA','OPERADOR')")
    public ResponseEntity<ApiResponse<ActivityResponseDto>> create(@RequestBody ActivityCreateDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(activityService.createActivity(dto)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR_FROTA','OPERADOR','AUDITOR')")
    public ResponseEntity<ApiResponse<PagedResponse<ActivityResponseDto>>> list(
            @RequestParam(required = false) ActivityStatus status,
            @RequestParam(required = false) UUID vehicleId,
            @RequestParam(required = false) UUID driverId,
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") @Min(10) @Max(100) int size) {
        Page<ActivityResponseDto> result = activityService.listActivities(status, vehicleId, driverId, from, to,
                PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(new PagedResponse<>(
                result.getContent(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages())));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR_FROTA','OPERADOR','AUDITOR') or (hasRole('MOTORISTA') and @activitySecurityService.isAssignedDriver(#id))")
    public ResponseEntity<ApiResponse<ActivityResponseDto>> get(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(activityService.getActivity(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR_FROTA','OPERADOR')")
    public ResponseEntity<ApiResponse<ActivityResponseDto>> update(@PathVariable UUID id,
            @RequestBody ActivityUpdateDto dto) {
        return ResponseEntity.ok(ApiResponse.success(activityService.updateActivity(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR_FROTA','OPERADOR')")
    public ResponseEntity<ApiResponse<ActivityResponseDto>> delete(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(activityService.deleteActivity(id)));
    }

    @PostMapping("/{id}/allocate")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR_FROTA','OPERADOR')")
    public ResponseEntity<ApiResponse<ActivityResponseDto>> allocate(@PathVariable UUID id,
            @RequestBody AllocationRequestDto dto) {
        return ResponseEntity.ok(ApiResponse.success(activityService.allocate(id, dto)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR_FROTA','OPERADOR') or (hasRole('MOTORISTA') and @activitySecurityService.isAssignedDriver(#id))")
    public ResponseEntity<ApiResponse<ActivityResponseDto>> transitionStatus(@PathVariable UUID id,
            @RequestBody StatusTransitionDto dto) {
        return ResponseEntity.ok(ApiResponse.success(activityService.transitionStatus(id, dto)));
    }

    @GetMapping("/{id}/events")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR_FROTA','OPERADOR','AUDITOR') or (hasRole('MOTORISTA') and @activitySecurityService.isAssignedDriver(#id))")
    public ResponseEntity<ApiResponse<List<ActivityEventDto>>> events(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(activityService.getEvents(id)));
    }
}
