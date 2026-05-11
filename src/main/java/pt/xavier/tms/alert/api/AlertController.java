package pt.xavier.tms.alert.api;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pt.xavier.tms.alert.domain.Alert;
import pt.xavier.tms.alert.dto.AlertResponseDto;
import pt.xavier.tms.alert.repository.AlertRepository;
import pt.xavier.tms.alert.service.AlertResolutionService;
import pt.xavier.tms.shared.dto.ApiResponse;
import pt.xavier.tms.shared.dto.PagedResponse;
import pt.xavier.tms.shared.enums.AlertSeverity;
import pt.xavier.tms.shared.exception.ResourceNotFoundException;

@RestController
@RequestMapping("/api/v1/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertRepository alertRepository;
    private final AlertResolutionService alertResolutionService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR_FROTA','OPERADOR','AUDITOR')")
    public ResponseEntity<ApiResponse<PagedResponse<AlertResponseDto>>> list(
            @RequestParam(required = false) Boolean resolved,
            @RequestParam(required = false) AlertSeverity severity,
            @RequestParam(required = false) String entityType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AlertResponseDto> result = alertRepository
                .findByFilters(resolved, severity, entityType, PageRequest.of(page, size))
                .map(this::toDto);
        return ResponseEntity.ok(ApiResponse.success(new PagedResponse<>(
                result.getContent(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages())));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR_FROTA','OPERADOR','AUDITOR')")
    public ResponseEntity<ApiResponse<AlertResponseDto>> get(@PathVariable UUID id) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ALERT_NOT_FOUND", "Alert not found"));
        return ResponseEntity.ok(ApiResponse.success(toDto(alert)));
    }

    @PatchMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR_FROTA')")
    public ResponseEntity<ApiResponse<AlertResponseDto>> resolve(@PathVariable UUID id,
            @RequestBody ResolveAlertRequest request) {
        Alert resolved = alertResolutionService.resolveManually(id, request.resolvedBy() == null ? "system" : request.resolvedBy());
        return ResponseEntity.ok(ApiResponse.success(toDto(resolved)));
    }

    private AlertResponseDto toDto(Alert alert) {
        return new AlertResponseDto(
                alert.getId(),
                alert.getAlertType(),
                alert.getSeverity(),
                alert.getEntityType(),
                alert.getEntityId(),
                alert.getTitle(),
                alert.getMessage(),
                alert.isResolved(),
                alert.getResolvedAt(),
                alert.getResolvedBy(),
                alert.getCreatedAt());
    }

    public record ResolveAlertRequest(String resolvedBy) {
    }
}
