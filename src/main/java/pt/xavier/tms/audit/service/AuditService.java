package pt.xavier.tms.audit.service;

import java.time.Instant;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import pt.xavier.tms.audit.domain.AuditLog;
import pt.xavier.tms.audit.event.AuditEvent;
import pt.xavier.tms.audit.repository.AuditLogRepository;
import pt.xavier.tms.shared.enums.AuditOperation;
import pt.xavier.tms.shared.exception.ResourceNotFoundException;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @ApplicationModuleListener
    public void onAuditEvent(AuditEvent event) {
        AuditLog log = AuditLog.of(
                event.entityType(),
                event.entityId(),
                event.operation(),
                event.performedBy(),
                event.ipAddress(),
                event.previousValues(),
                event.newValues(),
                event.occurredAt());
        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> list(String entityType,
                               AuditOperation operation,
                               String performedBy,
                               Instant from,
                               Instant to,
                               Pageable pageable) {
        return auditLogRepository.findByFilters(entityType, operation, performedBy, from, to, pageable);
    }

    @Transactional(readOnly = true)
    public AuditLog get(UUID id) {
        return auditLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AUDIT_LOG_NOT_FOUND", "Audit log not found"));
    }
}
