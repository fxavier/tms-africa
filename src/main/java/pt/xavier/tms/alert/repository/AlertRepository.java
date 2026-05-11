package pt.xavier.tms.alert.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pt.xavier.tms.alert.domain.Alert;
import pt.xavier.tms.shared.enums.AlertSeverity;
import pt.xavier.tms.shared.enums.AlertType;

public interface AlertRepository extends JpaRepository<Alert, UUID> {

    Page<Alert> findByResolvedFalse(Pageable pageable);

    Page<Alert> findByResolvedFalseAndSeverity(AlertSeverity severity, Pageable pageable);

    boolean existsByAlertTypeAndEntityIdAndResolvedFalse(AlertType type, UUID entityId);

    Optional<Alert> findByAlertTypeAndEntityIdAndResolvedFalse(AlertType type, UUID entityId);

    List<Alert> findByAlertTypeInAndResolvedFalse(List<AlertType> types);

    @Query("""
            SELECT a FROM Alert a
            WHERE (:resolved IS NULL OR a.resolved = :resolved)
              AND (:severity IS NULL OR a.severity = :severity)
              AND (:entityType IS NULL OR a.entityType = :entityType)
            """)
    Page<Alert> findByFilters(@Param("resolved") Boolean resolved,
                              @Param("severity") AlertSeverity severity,
                              @Param("entityType") String entityType,
                              Pageable pageable);
}
