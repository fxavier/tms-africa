package pt.xavier.tms.alert.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import pt.xavier.tms.shared.enums.AlertType;

@Getter
@Setter
@Entity
@Table(name = "alert_configurations")
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor(access = AccessLevel.PUBLIC)
public class AlertConfiguration {

    @Id
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "alert_type", nullable = false, length = 40)
    private AlertType alertType;

    @Column(name = "entity_type", nullable = false, length = 80)
    private String entityType;

    @Column(name = "days_before_warning", nullable = false)
    private Integer daysBeforeWarning;

    @Column(name = "days_before_critical", nullable = false)
    private Integer daysBeforeCritical;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @CreatedBy
    @Column(name = "created_by", nullable = false, updatable = false, length = 100)
    private String createdBy;

    @LastModifiedBy
    @Column(name = "updated_by", nullable = false, length = 100)
    private String updatedBy;

    public static AlertConfiguration defaults(AlertType alertType, String entityType) {
        AlertConfiguration cfg = new AlertConfiguration();
        cfg.setId(UUID.randomUUID());
        cfg.setAlertType(alertType);
        cfg.setEntityType(entityType);
        cfg.setDaysBeforeWarning(30);
        cfg.setDaysBeforeCritical(7);
        cfg.setActive(true);
        return cfg;
    }
}
