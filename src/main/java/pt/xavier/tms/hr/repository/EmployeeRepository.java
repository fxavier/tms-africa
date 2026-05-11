package pt.xavier.tms.hr.repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import pt.xavier.tms.hr.domain.Employee;

public interface EmployeeRepository extends JpaRepository<Employee, UUID>, JpaSpecificationExecutor<Employee> {
    Optional<Employee> findByEmployeeNumber(String employeeNumber);

    boolean existsByEmployeeNumber(String employeeNumber);

    boolean existsByIdNumber(String idNumber);
}
