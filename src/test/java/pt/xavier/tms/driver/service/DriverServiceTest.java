package pt.xavier.tms.driver.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pt.xavier.tms.driver.domain.Driver;
import pt.xavier.tms.driver.dto.DriverCreateDto;
import pt.xavier.tms.driver.repository.DriverRepository;
import pt.xavier.tms.hr.domain.Employee;
import pt.xavier.tms.hr.domain.EmployeeFunction;
import pt.xavier.tms.hr.repository.EmployeeRepository;
import pt.xavier.tms.integration.config.DriverAvailabilityConfig;
import pt.xavier.tms.integration.dto.DriverAvailabilityDto;
import pt.xavier.tms.integration.port.DriverAvailabilityPort;
import pt.xavier.tms.shared.enums.DriverStatus;
import pt.xavier.tms.shared.enums.EmployeeStatus;
import pt.xavier.tms.shared.exception.BusinessException;

@ExtendWith(MockitoExtension.class)
class DriverServiceTest {

    @Mock
    private DriverRepository driverRepository;
    @Mock
    private EmployeeRepository employeeRepository;
    @Mock
    private DriverAvailabilityPort driverAvailabilityPort;

    private DriverService driverService;

    @BeforeEach
    void setUp() {
        driverService = new DriverService(
                driverRepository,
                employeeRepository,
                driverAvailabilityPort,
                new DriverAvailabilityConfig(List.of("DRIVER", "MOTORISTA")));
    }

    @Test
    void createDriverWithDuplicateIdNumberShouldThrowBusinessException() {
        when(driverRepository.existsByIdNumber("ID-123")).thenReturn(true);

        DriverCreateDto dto = new DriverCreateDto(
                "Joao", "840000000", "Maputo", "ID-123", "LIC-1", "C",
                java.time.LocalDate.now().minusYears(1), java.time.LocalDate.now().plusYears(1),
                "Maputo", DriverStatus.ATIVO, null, null);

        assertThatThrownBy(() -> driverService.createDriver(dto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("idNumber already exists");
    }

    @Test
    void getAvailabilityWhenInternalHrReturnsUnavailableShouldReturnUnavailable() {
        UUID id = UUID.randomUUID();
        Driver driver = new Driver();
        driver.setId(id);
        when(driverRepository.findById(id)).thenReturn(Optional.of(driver));
        when(driverAvailabilityPort.checkAvailability(org.mockito.ArgumentMatchers.eq(id), org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any()))
                .thenReturn(new DriverAvailabilityDto(id, false, "EMPLOYEE_INACTIVE", java.util.List.of()));

        DriverAvailabilityDto result = driverService.getAvailability(id);

        assertThat(result.available()).isFalse();
        assertThat(result.reason()).isEqualTo("EMPLOYEE_INACTIVE");
    }

    @Test
    void createDriverWithEmployeeFunctionCodeNotAllowedShouldThrowBusinessException() {
        UUID employeeId = UUID.randomUUID();
        EmployeeFunction function = new EmployeeFunction();
        function.setCode("1234");
        function.setName("Motorista");

        Employee employee = new Employee();
        employee.setId(employeeId);
        employee.setStatus(EmployeeStatus.ACTIVE);
        employee.setFunction(function);

        when(driverRepository.existsByIdNumber("ID-456")).thenReturn(false);
        when(driverRepository.existsByLicenseNumber("LIC-456")).thenReturn(false);
        when(employeeRepository.findById(employeeId)).thenReturn(Optional.of(employee));

        DriverCreateDto dto = new DriverCreateDto(
                "Joao", "840000000", "Maputo", "ID-456", "LIC-456", "C",
                java.time.LocalDate.now().minusYears(1), java.time.LocalDate.now().plusYears(1),
                "Maputo", DriverStatus.ATIVO, employeeId, null);

        assertThatThrownBy(() -> driverService.createDriver(dto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("1234")
                .hasMessageContaining("DRIVER");
    }
}
