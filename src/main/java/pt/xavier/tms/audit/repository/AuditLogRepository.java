package pt.xavier.tms.audit.repository;

import java.time.Instant;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pt.xavier.tms.audit.domain.AuditLog;
import pt.xavier.tms.shared.enums.AuditOperation;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    @Query("""
            SELECT a FROM AuditLog a
            WHERE (:entityType IS NULL OR a.entityType = :entityType)
              AND (:operation IS NULL OR a.operation = :operation)
              AND (:performedBy IS NULL OR a.performedBy = :performedBy)
              AND (:fromDate IS NULL OR a.occurredAt >= :fromDate)
              AND (:toDate IS NULL OR a.occurredAt <= :toDate)
            ORDER BY a.occurredAt DESC
            """)
    Page<AuditLog> findByFilters(@Param("entityType") String entityType,
                                 @Param("operation") AuditOperation operation,
                                 @Param("performedBy") String performedBy,
                                 @Param("fromDate") Instant fromDate,
                                 @Param("toDate") Instant toDate,
                                 Pageable pageable);
}
