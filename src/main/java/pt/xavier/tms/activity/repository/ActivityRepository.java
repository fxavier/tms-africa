package pt.xavier.tms.activity.repository;

import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pt.xavier.tms.activity.domain.Activity;

public interface ActivityRepository extends JpaRepository<Activity, UUID>, JpaSpecificationExecutor<Activity> {

    Optional<Activity> findByCode(String code);

    boolean existsByIdAndDriver_Id(UUID activityId, UUID driverId);

    long countByCodeStartingWith(String prefix);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT a FROM Activity a
            WHERE a.vehicle.id = :vehicleId
              AND a.status IN (pt.xavier.tms.shared.enums.ActivityStatus.PLANEADA, pt.xavier.tms.shared.enums.ActivityStatus.EM_CURSO)
              AND a.deletedAt IS NULL
              AND a.plannedStart < :end
              AND a.plannedEnd > :start
              AND (:excludeActivityId IS NULL OR a.id <> :excludeActivityId)
            """)
    List<Activity> findConflictingActivitiesForVehicle(@Param("vehicleId") UUID vehicleId,
                                                       @Param("start") Instant start,
                                                       @Param("end") Instant end,
                                                       @Param("excludeActivityId") UUID excludeActivityId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT a FROM Activity a
            WHERE a.driver.id = :driverId
              AND a.status IN (pt.xavier.tms.shared.enums.ActivityStatus.PLANEADA, pt.xavier.tms.shared.enums.ActivityStatus.EM_CURSO)
              AND a.deletedAt IS NULL
              AND a.plannedStart < :end
              AND a.plannedEnd > :start
              AND (:excludeActivityId IS NULL OR a.id <> :excludeActivityId)
            """)
    List<Activity> findConflictingActivitiesForDriver(@Param("driverId") UUID driverId,
                                                      @Param("start") Instant start,
                                                      @Param("end") Instant end,
                                                      @Param("excludeActivityId") UUID excludeActivityId);
}
