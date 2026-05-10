package pt.xavier.tms.vehicle.repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pt.xavier.tms.shared.enums.VehicleStatus;
import pt.xavier.tms.vehicle.domain.Vehicle;

public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {

    Optional<Vehicle> findByPlate(String plate);

    Page<Vehicle> findByPlateContainingIgnoreCase(String q, Pageable pageable);

    boolean existsByPlate(String plate);

    @Query("""
            SELECT v FROM Vehicle v
            WHERE (:status IS NULL OR v.status = :status)
              AND (:location IS NULL OR LOWER(v.activityLocation) LIKE LOWER(CONCAT('%', :location, '%')))
            """)
    Page<Vehicle> findAllByFilters(@Param("status") VehicleStatus status,
                                   @Param("location") String location,
                                   Pageable pageable);
}
