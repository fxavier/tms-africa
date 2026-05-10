package pt.xavier.tms.driver.service;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.xavier.tms.audit.annotation.Auditable;
import pt.xavier.tms.driver.domain.Driver;
import pt.xavier.tms.driver.dto.DriverCreateDto;
import pt.xavier.tms.driver.dto.DriverResponseDto;
import pt.xavier.tms.driver.dto.DriverUpdateDto;
import pt.xavier.tms.driver.repository.DriverRepository;
import pt.xavier.tms.hr.repository.EmployeeRepository;
import pt.xavier.tms.integration.dto.DriverAvailabilityDto;
import pt.xavier.tms.integration.port.DriverAvailabilityPort;
import pt.xavier.tms.shared.enums.AuditOperation;
import pt.xavier.tms.shared.enums.DriverStatus;
import pt.xavier.tms.shared.exception.BusinessException;
import pt.xavier.tms.shared.exception.ResourceNotFoundException;

@Service
@RequiredArgsConstructor
public class DriverService {

    private final DriverRepository driverRepository;
    private final EmployeeRepository employeeRepository;
    private final DriverAvailabilityPort driverAvailabilityPort;

    @Transactional
    @Auditable(entityType = "DRIVER", operation = AuditOperation.CRIACAO)
    public DriverResponseDto createDriver(DriverCreateDto dto) {
        if (driverRepository.existsByIdNumber(dto.idNumber())) {
            throw new BusinessException("ID_NUMBER_ALREADY_EXISTS", "Driver idNumber already exists");
        }
        if (driverRepository.existsByLicenseNumber(dto.licenseNumber())) {
            throw new BusinessException("LICENSE_NUMBER_ALREADY_EXISTS", "Driver licenseNumber already exists");
        }
        validateEmployeeLink(dto.employeeId());

        Driver driver = new Driver();
        driver.setId(UUID.randomUUID());
        driver.setFullName(dto.fullName());
        driver.setPhone(dto.phone());
        driver.setAddress(dto.address());
        driver.setIdNumber(dto.idNumber());
        driver.setLicenseNumber(dto.licenseNumber());
        driver.setLicenseCategory(dto.licenseCategory());
        driver.setLicenseIssueDate(dto.licenseIssueDate());
        driver.setLicenseExpiryDate(dto.licenseExpiryDate());
        driver.setActivityLocation(dto.activityLocation());
        driver.setStatus(dto.status() == null ? DriverStatus.ATIVO : dto.status());
        driver.setEmployeeId(dto.employeeId());
        driver.setNotes(dto.notes());

        return toDto(driverRepository.save(driver));
    }

    @Transactional
    @Auditable(entityType = "DRIVER", operation = AuditOperation.ATUALIZACAO)
    public DriverResponseDto updateDriver(UUID id, DriverUpdateDto dto) {
        Driver driver = getEntity(id);
        validateEmployeeLink(dto.employeeId());

        if (dto.fullName() != null) driver.setFullName(dto.fullName());
        if (dto.phone() != null) driver.setPhone(dto.phone());
        if (dto.address() != null) driver.setAddress(dto.address());
        if (dto.licenseCategory() != null) driver.setLicenseCategory(dto.licenseCategory());
        if (dto.licenseIssueDate() != null) driver.setLicenseIssueDate(dto.licenseIssueDate());
        if (dto.licenseExpiryDate() != null) driver.setLicenseExpiryDate(dto.licenseExpiryDate());
        if (dto.activityLocation() != null) driver.setActivityLocation(dto.activityLocation());
        if (dto.status() != null) driver.setStatus(dto.status());
        driver.setEmployeeId(dto.employeeId());
        if (dto.notes() != null) driver.setNotes(dto.notes());

        return toDto(driverRepository.save(driver));
    }

    @Transactional
    @Auditable(entityType = "DRIVER", operation = AuditOperation.ATUALIZACAO)
    public DriverResponseDto updateStatus(UUID id, DriverStatus status) {
        Driver driver = getEntity(id);
        driver.setStatus(status);
        return toDto(driverRepository.save(driver));
    }

    @Transactional
    @Auditable(entityType = "DRIVER", operation = AuditOperation.ELIMINACAO)
    public void deleteDriver(UUID id) {
        Driver driver = getEntity(id);
        driver.softDelete("system");
        driverRepository.save(driver);
    }

    @Transactional(readOnly = true)
    public DriverResponseDto getDriver(UUID id) {
        return toDto(getEntity(id));
    }

    @Transactional(readOnly = true)
    public Page<DriverResponseDto> listDrivers(DriverStatus status, String location, Pageable pageable) {
        return driverRepository.findAllByFilters(status, location, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public DriverAvailabilityDto getAvailability(UUID driverId) {
        Driver driver = getEntity(driverId);
        return driverAvailabilityPort.checkAvailability(driver.getId(), java.time.LocalDate.now(), java.time.LocalDate.now());
    }

    @Transactional(readOnly = true)
    public Driver getEntity(UUID id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DRIVER_NOT_FOUND", "Driver not found"));
    }

    private void validateEmployeeLink(UUID employeeId) {
        if (employeeId == null) {
            return;
        }
        var employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("EMPLOYEE_NOT_FOUND", "Employee not found"));
        if (employee.getStatus() != pt.xavier.tms.shared.enums.EmployeeStatus.ACTIVE) {
            throw new BusinessException("EMPLOYEE_INACTIVE", "Associated employee must be ACTIVE");
        }
        if (employee.getFunction() != null) {
            String code = employee.getFunction().getCode();
            if (!("DRIVER".equalsIgnoreCase(code) || "MOTORISTA".equalsIgnoreCase(code))) {
                throw new BusinessException("EMPLOYEE_FUNCTION_NOT_ALLOWED_FOR_DRIVER", "Employee function is not allowed for driver association");
            }
        }
    }

    private DriverResponseDto toDto(Driver driver) {
        return new DriverResponseDto(
                driver.getId(),
                driver.getFullName(),
                driver.getPhone(),
                driver.getAddress(),
                driver.getIdNumber(),
                driver.getLicenseNumber(),
                driver.getLicenseCategory(),
                driver.getLicenseIssueDate(),
                driver.getLicenseExpiryDate(),
                driver.getActivityLocation(),
                driver.getStatus(),
                driver.getEmployeeId(),
                driver.getNotes()
        );
    }
}
