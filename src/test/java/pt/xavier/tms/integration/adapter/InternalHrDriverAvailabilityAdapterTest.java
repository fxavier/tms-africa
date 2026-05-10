package pt.xavier.tms.integration.adapter;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pt.xavier.tms.driver.domain.Driver;
import pt.xavier.tms.driver.repository.DriverRepository;
import pt.xavier.tms.hr.domain.Employee;
import pt.xavier.tms.hr.domain.EmployeeFunction;
import pt.xavier.tms.hr.repository.EmployeeRepository;
import pt.xavier.tms.integration.config.DriverAvailabilityConfig;
import pt.xavier.tms.shared.enums.EmployeeStatus;

@ExtendWith(MockitoExtension.class)
class InternalHrDriverAvailabilityAdapterTest {

    @Mock
    private DriverRepository driverRepository;
    @Mock
    private EmployeeRepository employeeRepository;

    @Test
    void shouldReturnDriverEmployeeNotLinkedWhenNoEmployeeId() {
        Driver driver = new Driver();
        UUID driverId = UUID.randomUUID();
        driver.setId(driverId);
        when(driverRepository.findById(driverId)).thenReturn(Optional.of(driver));

        InternalHrDriverAvailabilityAdapter adapter = new InternalHrDriverAvailabilityAdapter(
                driverRepository, employeeRepository, new DriverAvailabilityConfig(List.of("DRIVER", "MOTORISTA")));

        var result = adapter.checkAvailability(driverId, LocalDate.now(), LocalDate.now());

        assertThat(result.available()).isFalse();
        assertThat(result.reason()).isEqualTo("DRIVER_EMPLOYEE_NOT_LINKED");
    }

    @Test
    void shouldReturnEmployeeNotFoundWhenEmployeeMissing() {
        Driver driver = new Driver();
        UUID driverId = UUID.randomUUID();
        UUID employeeId = UUID.randomUUID();
        driver.setId(driverId);
        driver.setEmployeeId(employeeId);
        when(driverRepository.findById(driverId)).thenReturn(Optional.of(driver));
        when(employeeRepository.findById(employeeId)).thenReturn(Optional.empty());

        InternalHrDriverAvailabilityAdapter adapter = new InternalHrDriverAvailabilityAdapter(
                driverRepository, employeeRepository, new DriverAvailabilityConfig(List.of("DRIVER", "MOTORISTA")));

        var result = adapter.checkAvailability(driverId, LocalDate.now(), LocalDate.now());

        assertThat(result.available()).isFalse();
        assertThat(result.reason()).isEqualTo("EMPLOYEE_NOT_FOUND");
    }

    @Test
    void shouldReturnEmployeeInactiveWhenStatusIsSuspended() {
        Driver driver = new Driver();
        UUID driverId = UUID.randomUUID();
        UUID employeeId = UUID.randomUUID();
        driver.setId(driverId);
        driver.setEmployeeId(employeeId);

        Employee employee = new Employee();
        employee.setId(employeeId);
        employee.setStatus(EmployeeStatus.SUSPENDED);

        when(driverRepository.findById(driverId)).thenReturn(Optional.of(driver));
        when(employeeRepository.findById(employeeId)).thenReturn(Optional.of(employee));

        InternalHrDriverAvailabilityAdapter adapter = new InternalHrDriverAvailabilityAdapter(
                driverRepository, employeeRepository, new DriverAvailabilityConfig(List.of("DRIVER", "MOTORISTA")));

        var result = adapter.checkAvailability(driverId, LocalDate.now(), LocalDate.now());

        assertThat(result.available()).isFalse();
        assertThat(result.reason()).isEqualTo("EMPLOYEE_INACTIVE");
    }

    @Test
    void shouldReturnFunctionNotAllowedWhenCodeIsInvalid() {
        Driver driver = new Driver();
        UUID driverId = UUID.randomUUID();
        UUID employeeId = UUID.randomUUID();
        driver.setId(driverId);
        driver.setEmployeeId(employeeId);

        EmployeeFunction function = new EmployeeFunction();
        function.setCode("WAREHOUSE");

        Employee employee = new Employee();
        employee.setId(employeeId);
        employee.setStatus(EmployeeStatus.ACTIVE);
        employee.setFunction(function);

        when(driverRepository.findById(driverId)).thenReturn(Optional.of(driver));
        when(employeeRepository.findById(employeeId)).thenReturn(Optional.of(employee));

        InternalHrDriverAvailabilityAdapter adapter = new InternalHrDriverAvailabilityAdapter(
                driverRepository, employeeRepository, new DriverAvailabilityConfig(List.of("DRIVER", "MOTORISTA")));

        var result = adapter.checkAvailability(driverId, LocalDate.now(), LocalDate.now());

        assertThat(result.available()).isFalse();
        assertThat(result.reason()).isEqualTo("EMPLOYEE_FUNCTION_NOT_ALLOWED_FOR_DRIVER");
    }

    @Test
    void shouldReturnAvailableWhenEmployeeActiveAndFunctionAllowed() {
        Driver driver = new Driver();
        UUID driverId = UUID.randomUUID();
        UUID employeeId = UUID.randomUUID();
        driver.setId(driverId);
        driver.setEmployeeId(employeeId);

        EmployeeFunction function = new EmployeeFunction();
        function.setCode("DRIVER");

        Employee employee = new Employee();
        employee.setId(employeeId);
        employee.setStatus(EmployeeStatus.ACTIVE);
        employee.setFunction(function);

        when(driverRepository.findById(driverId)).thenReturn(Optional.of(driver));
        when(employeeRepository.findById(employeeId)).thenReturn(Optional.of(employee));

        InternalHrDriverAvailabilityAdapter adapter = new InternalHrDriverAvailabilityAdapter(
                driverRepository, employeeRepository, new DriverAvailabilityConfig(List.of("DRIVER", "MOTORISTA")));

        var result = adapter.checkAvailability(driverId, LocalDate.now(), LocalDate.now());

        assertThat(result.available()).isTrue();
        assertThat(result.reason()).isEqualTo("AVAILABLE");
    }
}
