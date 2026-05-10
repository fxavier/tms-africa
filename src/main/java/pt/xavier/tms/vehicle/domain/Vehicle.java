package pt.xavier.tms.vehicle.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import pt.xavier.tms.shared.enums.VehicleStatus;

@Getter
@Entity
@Table(name = "vehicles")
@SQLRestriction("deleted_at IS NULL")
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor
@Setter
public class Vehicle {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true, length = 20)
    private String plate;

    @Column(nullable = false, length = 100)
    private String brand;

    @Column(nullable = false, length = 100)
    private String model;

    @Column(name = "vehicle_type", nullable = false, length = 100)
    private String vehicleType;

    @Column(nullable = false)
    private Integer capacity;

    @Column(name = "activity_location", nullable = false, length = 200)
    private String activityLocation;

    @Column(name = "activity_start_date", nullable = false)
    private LocalDate activityStartDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private VehicleStatus status;

    @Column(name = "current_driver_id")
    private UUID currentDriverId;

    @Column(columnDefinition = "TEXT")
    private String notes;

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

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL, orphanRemoval = false, fetch = FetchType.LAZY)
    private List<VehicleDocument> documents = new ArrayList<>();

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL, orphanRemoval = false, fetch = FetchType.LAZY)
    private List<VehicleAccessory> accessories = new ArrayList<>();

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL, orphanRemoval = false, fetch = FetchType.LAZY)
    private List<MaintenanceRecord> maintenanceRecords = new ArrayList<>();

    public void softDelete(String deletedByUser) {
        this.deletedAt = Instant.now();
        this.deletedBy = deletedByUser;
    }
}
