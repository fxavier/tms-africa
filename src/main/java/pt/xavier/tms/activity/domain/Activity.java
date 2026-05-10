package pt.xavier.tms.activity.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import pt.xavier.tms.driver.domain.Driver;
import pt.xavier.tms.shared.enums.ActivityPriority;
import pt.xavier.tms.shared.enums.ActivityStatus;
import pt.xavier.tms.vehicle.domain.Vehicle;

@Getter
@Setter
@Entity
@Table(name = "activities")
@SQLRestriction("deleted_at IS NULL")
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor(access = AccessLevel.PUBLIC)
public class Activity {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true, length = 30)
    private String code;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(name = "activity_type", nullable = false, length = 100)
    private String activityType;

    @Column(nullable = false, length = 300)
    private String location;

    @Column(name = "planned_start", nullable = false)
    private Instant plannedStart;

    @Column(name = "planned_end", nullable = false)
    private Instant plannedEnd;

    @Column(name = "actual_start")
    private Instant actualStart;

    @Column(name = "actual_end")
    private Instant actualEnd;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ActivityPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ActivityStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private Driver driver;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "rh_override_justification", columnDefinition = "TEXT")
    private String rhOverrideJustification;

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

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "deleted_by", length = 100)
    private String deletedBy;

    @OneToMany(mappedBy = "activity", cascade = CascadeType.ALL, orphanRemoval = false, fetch = FetchType.LAZY)
    @OrderBy("performedAt ASC")
    private List<ActivityEvent> events = new ArrayList<>();

    public void softDelete(String deletedByUser) {
        this.deletedAt = Instant.now();
        this.deletedBy = deletedByUser;
    }
}
