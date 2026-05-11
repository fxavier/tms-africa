package pt.xavier.tms.vehicle.repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import pt.xavier.tms.vehicle.domain.Vehicle;

public interface VehicleRepository extends JpaRepository<Vehicle, UUID>, JpaSpecificationExecutor<Vehicle> {

    Optional<Vehicle> findByPlate(String plate);

    Page<Vehicle> findByPlateContainingIgnoreCase(String q, Pageable pageable);

    boolean existsByPlate(String plate);
}
