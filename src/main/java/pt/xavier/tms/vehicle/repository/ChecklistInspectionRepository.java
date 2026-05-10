package pt.xavier.tms.vehicle.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import pt.xavier.tms.vehicle.domain.ChecklistInspection;

public interface ChecklistInspectionRepository extends JpaRepository<ChecklistInspection, UUID> {

    Optional<ChecklistInspection> findTopByVehicle_IdOrderByPerformedAtDesc(UUID vehicleId);

    Page<ChecklistInspection> findByVehicle_Id(UUID vehicleId, Pageable pageable);

    List<ChecklistInspection> findByVehicle_Id(UUID vehicleId);
}
