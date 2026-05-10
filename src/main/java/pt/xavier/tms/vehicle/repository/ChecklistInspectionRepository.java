package pt.xavier.tms.vehicle.repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import pt.xavier.tms.vehicle.domain.ChecklistInspection;

public interface ChecklistInspectionRepository extends JpaRepository<ChecklistInspection, UUID> {

    Optional<ChecklistInspection> findTopByVehicle_IdOrderByPerformedAtDesc(UUID vehicleId);
}
