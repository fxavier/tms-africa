package pt.xavier.tms.vehicle.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import pt.xavier.tms.vehicle.domain.ChecklistTemplate;

public interface ChecklistTemplateRepository extends JpaRepository<ChecklistTemplate, UUID> {

    List<ChecklistTemplate> findByVehicleTypeAndActiveTrue(String vehicleType);
}
