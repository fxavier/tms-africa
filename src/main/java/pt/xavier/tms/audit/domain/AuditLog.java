package pt.xavier.tms.audit.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import pt.xavier.tms.shared.enums.AuditOperation;

@Getter
@Entity
@Table(name = "audit_logs")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AuditLog {

    @Id
    private UUID id;

    @Column(name = "entity_type", nullable = false, length = 100)
    private String entityType;

    @Column(name = "entity_id")
    private UUID entityId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AuditOperation operation;

    @Column(name = "performed_by", nullable = false, length = 100)
    private String performedBy;

    @Column(name = "ip_address", length = 100)
    private String ipAddress;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "previous_values", columnDefinition = "jsonb")
    private Map<String, Object> previousValues;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "new_values", columnDefinition = "jsonb")
    private Map<String, Object> newValues;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "created_by", nullable = false, length = 100)
    private String createdBy;

    public static AuditLog of(
            String entityType,
            UUID entityId,
            AuditOperation operation,
            String performedBy,
            String ipAddress,
            Map<String, Object> previousValues,
            Map<String, Object> newValues,
            Instant occurredAt
    ) {
        AuditLog log = new AuditLog();
        log.id = UUID.randomUUID();
        log.entityType = entityType;
        log.entityId = entityId;
        log.operation = operation;
        log.performedBy = performedBy;
        log.ipAddress = ipAddress;
        log.previousValues = previousValues;
        log.newValues = newValues;
        log.occurredAt = occurredAt;
        log.createdAt = Instant.now();
        log.createdBy = performedBy == null || performedBy.isBlank() ? "system" : performedBy;
        return log;
    }
}
