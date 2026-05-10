package pt.xavier.tms.vehicle.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import pt.xavier.tms.shared.enums.ChecklistItemStatus;

@Getter
@Entity
@Table(name = "checklist_inspection_items")
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor
@Setter
public class ChecklistInspectionItem {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "inspection_id", nullable = false)
    private ChecklistInspection inspection;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_item_id")
    private ChecklistTemplateItem templateItem;

    @Column(name = "item_name", nullable = false, length = 200)
    private String itemName;

    @Column(name = "is_critical", nullable = false)
    private boolean critical;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ChecklistItemStatus status;

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

    public boolean isCritical() {
        return critical;
    }

    public ChecklistItemStatus getStatus() {
        return status;
    }

    public ChecklistTemplateItem getTemplateItem() {
        return templateItem;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public void setInspection(ChecklistInspection inspection) {
        this.inspection = inspection;
    }

    public void setTemplateItem(ChecklistTemplateItem templateItem) {
        this.templateItem = templateItem;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public void setCritical(boolean critical) {
        this.critical = critical;
    }

    public void setStatus(ChecklistItemStatus status) {
        this.status = status;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
