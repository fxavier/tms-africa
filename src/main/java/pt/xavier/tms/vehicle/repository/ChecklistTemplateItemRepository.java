package pt.xavier.tms.vehicle.repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import pt.xavier.tms.vehicle.domain.ChecklistTemplateItem;

public interface ChecklistTemplateItemRepository extends JpaRepository<ChecklistTemplateItem, UUID> {
}
