package pt.xavier.tms.audit.api;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pt.xavier.tms.audit.domain.AuditLog;
import pt.xavier.tms.audit.dto.AuditQueryDto;
import pt.xavier.tms.audit.dto.AuditLogResponseDto;
import pt.xavier.tms.audit.service.AuditService;
import pt.xavier.tms.shared.dto.ApiResponse;
import pt.xavier.tms.shared.dto.PagedResponse;
import pt.xavier.tms.shared.enums.AuditOperation;

@RestController
@RequestMapping("/api/v1/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','AUDITOR')")
    public ResponseEntity<ApiResponse<PagedResponse<AuditLogResponseDto>>> list(
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) UUID entityId,
            @RequestParam(required = false) AuditOperation operation,
            @RequestParam(required = false) String performedBy,
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        AuditQueryDto query = new AuditQueryDto(entityType, entityId, operation, performedBy, from, to);
        Pageable pageable = PageRequest.of(page, size);
        Page<AuditLogResponseDto> result = auditService.list(
                        query.entityType(),
                        query.entityId(),
                        query.operation(),
                        query.performedBy(),
                        toStartOfDay(query.from()),
                        toEndOfDay(query.to()),
                        pageable)
                .map(this::toDto);

        PagedResponse<AuditLogResponseDto> response = new PagedResponse<>(
                result.getContent(), result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','AUDITOR')")
    public ResponseEntity<ApiResponse<AuditLogResponseDto>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(toDto(auditService.get(id))));
    }

    private AuditLogResponseDto toDto(AuditLog log) {
        return new AuditLogResponseDto(
                log.getId(),
                log.getEntityType(),
                log.getEntityId(),
                log.getOperation(),
                log.getPerformedBy(),
                log.getIpAddress(),
                log.getPreviousValues(),
                log.getNewValues(),
                log.getOccurredAt());
    }

    private Instant toStartOfDay(LocalDate date) {
        return date == null ? null : date.atStartOfDay().toInstant(ZoneOffset.UTC);
    }

    private Instant toEndOfDay(LocalDate date) {
        return date == null ? null : date.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC).minusNanos(1);
    }
}
