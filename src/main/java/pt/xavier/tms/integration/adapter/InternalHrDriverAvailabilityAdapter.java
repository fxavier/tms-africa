package pt.xavier.tms.integration.adapter;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pt.xavier.tms.driver.repository.DriverRepository;
import pt.xavier.tms.hr.domain.Employee;
import pt.xavier.tms.hr.repository.EmployeeRepository;
import pt.xavier.tms.integration.config.DriverAvailabilityConfig;
import pt.xavier.tms.integration.dto.DriverAvailabilityDto;
import pt.xavier.tms.integration.dto.EmployeeAbsenceDto;
import pt.xavier.tms.integration.port.DriverAvailabilityPort;
import pt.xavier.tms.shared.enums.EmployeeStatus;

@Component
@RequiredArgsConstructor
public class InternalHrDriverAvailabilityAdapter implements DriverAvailabilityPort {

    private final DriverRepository driverRepository;
    private final EmployeeRepository employeeRepository;
    private final DriverAvailabilityConfig availabilityConfig;

    @Override
    public DriverAvailabilityDto checkAvailability(UUID driverId, LocalDate startDate, LocalDate endDate) {
        var driverOpt = driverRepository.findById(driverId);
        if (driverOpt.isEmpty()) {
            return new DriverAvailabilityDto(driverId, false, "DRIVER_NOT_FOUND", List.of());
        }

        var driver = driverOpt.get();
        if (driver.getEmployeeId() == null) {
            return new DriverAvailabilityDto(driverId, false, "DRIVER_EMPLOYEE_NOT_LINKED", List.of());
        }

        Employee employee = employeeRepository.findById(driver.getEmployeeId()).orElse(null);
        if (employee == null) {
            return new DriverAvailabilityDto(driverId, false, "EMPLOYEE_NOT_FOUND", List.of());
        }

        if (employee.getStatus() != EmployeeStatus.ACTIVE) {
            return new DriverAvailabilityDto(driverId, false, "EMPLOYEE_INACTIVE", List.of());
        }

        if (employee.getFunction() != null) {
            String functionCode = employee.getFunction().getCode();
            boolean allowed = availabilityConfig.allowedCodesOrDefault().stream()
                    .anyMatch(code -> code.equalsIgnoreCase(functionCode));
            if (!allowed) {
                return new DriverAvailabilityDto(driverId, false, "EMPLOYEE_FUNCTION_NOT_ALLOWED_FOR_DRIVER", List.of());
            }
        }

        return new DriverAvailabilityDto(driverId, true, "AVAILABLE",
                List.of(new EmployeeAbsenceDto(startDate, endDate, "NONE")));
    }
}
