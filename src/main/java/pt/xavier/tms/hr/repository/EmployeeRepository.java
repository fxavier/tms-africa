package pt.xavier.tms.hr.repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pt.xavier.tms.hr.domain.Employee;
import pt.xavier.tms.shared.enums.EmployeeStatus;

public interface EmployeeRepository extends JpaRepository<Employee, UUID> {
    Optional<Employee> findByEmployeeNumber(String employeeNumber);

    boolean existsByEmployeeNumber(String employeeNumber);

    boolean existsByIdNumber(String idNumber);

    @Query("""
            SELECT e FROM Employee e
            WHERE (:status IS NULL OR e.status = :status)
              AND (:functionId IS NULL OR e.function.id = :functionId)
              AND (:q IS NULL OR LOWER(e.fullName) LIKE LOWER(CONCAT('%', :q, '%'))
                           OR LOWER(e.employeeNumber) LIKE LOWER(CONCAT('%', :q, '%')))
            """)
    Page<Employee> findAllByFilters(@Param("status") EmployeeStatus status,
                                    @Param("functionId") UUID functionId,
                                    @Param("q") String q,
                                    Pageable pageable);
}
