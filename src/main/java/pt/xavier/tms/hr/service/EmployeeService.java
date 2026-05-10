package pt.xavier.tms.hr.service;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.xavier.tms.hr.domain.Employee;
import pt.xavier.tms.hr.domain.EmployeeFunction;
import pt.xavier.tms.hr.dto.EmployeeCreateDto;
import pt.xavier.tms.hr.dto.EmployeeResponseDto;
import pt.xavier.tms.hr.dto.EmployeeUpdateDto;
import pt.xavier.tms.hr.mapper.EmployeeMapper;
import pt.xavier.tms.hr.repository.EmployeeRepository;
import pt.xavier.tms.shared.enums.EmployeeStatus;
import pt.xavier.tms.shared.exception.BusinessException;
import pt.xavier.tms.shared.exception.ResourceNotFoundException;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository repository;
    private final EmployeeFunctionService functionService;
    private final EmployeeMapper mapper;

    @Transactional
    public EmployeeResponseDto createEmployee(EmployeeCreateDto dto) {
        validateUnique(dto.employeeNumber(), dto.idNumber(), null);
        Employee entity = new Employee();
        entity.setId(UUID.randomUUID());
        applyCreateOrUpdate(entity, dto.fullName(), dto.phone(), dto.email(), dto.idNumber(), dto.functionId(),
                dto.status() == null ? EmployeeStatus.ACTIVE : dto.status(), dto.hireDate(), dto.terminationDate(),
                dto.baseSalary(), dto.currency(), dto.notes());
        entity.setEmployeeNumber(dto.employeeNumber());
        return mapper.toDto(repository.save(entity));
    }

    @Transactional
    public EmployeeResponseDto updateEmployee(UUID id, EmployeeUpdateDto dto) {
        Employee entity = getEntity(id);
        validateUnique(entity.getEmployeeNumber(), dto.idNumber(), id);
        applyCreateOrUpdate(entity, dto.fullName(), dto.phone(), dto.email(), dto.idNumber(), dto.functionId(),
                dto.status(), dto.hireDate(), dto.terminationDate(), dto.baseSalary(), dto.currency(), dto.notes());
        return mapper.toDto(repository.save(entity));
    }

    @Transactional
    public EmployeeResponseDto updateStatus(UUID id, EmployeeStatus status) {
        Employee entity = getEntity(id);
        entity.setStatus(status);
        return mapper.toDto(repository.save(entity));
    }

    @Transactional
    public void deleteEmployee(UUID id) {
        Employee entity = getEntity(id);
        entity.softDelete("system");
        repository.save(entity);
    }

    @Transactional(readOnly = true)
    public EmployeeResponseDto getEmployee(UUID id) {
        return mapper.toDto(getEntity(id));
    }

    @Transactional(readOnly = true)
    public Page<EmployeeResponseDto> listEmployees(EmployeeStatus status, UUID functionId, String q, Pageable pageable) {
        return repository.findAllByFilters(status, functionId, q, pageable).map(mapper::toDto);
    }

    @Transactional(readOnly = true)
    public Employee getEntity(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EMPLOYEE_NOT_FOUND", "Employee not found"));
    }

    private void validateUnique(String employeeNumber, String idNumber, UUID currentId) {
        if (currentId == null && repository.existsByEmployeeNumber(employeeNumber)) {
            throw new BusinessException("EMPLOYEE_NUMBER_ALREADY_EXISTS", "Employee number already exists");
        }
        if (idNumber != null && !idNumber.isBlank()) {
            boolean exists = repository.existsByIdNumber(idNumber);
            if (exists) {
                if (currentId == null || repository.findById(currentId).map(e -> !idNumber.equals(e.getIdNumber())).orElse(true)) {
                    throw new BusinessException("EMPLOYEE_ID_NUMBER_ALREADY_EXISTS", "ID number already exists");
                }
            }
        }
    }

    private void applyCreateOrUpdate(Employee entity,
                                     String fullName,
                                     String phone,
                                     String email,
                                     String idNumber,
                                     UUID functionId,
                                     EmployeeStatus status,
                                     java.time.LocalDate hireDate,
                                     java.time.LocalDate terminationDate,
                                     java.math.BigDecimal baseSalary,
                                     String currency,
                                     String notes) {
        if (fullName != null) {
            entity.setFullName(fullName);
        }
        entity.setPhone(phone);
        entity.setEmail(email);
        entity.setIdNumber(idNumber);
        if (functionId != null) {
            EmployeeFunction function = functionService.getEntity(functionId);
            entity.setFunction(function);
        }
        if (status != null) {
            entity.setStatus(status);
        }
        entity.setHireDate(hireDate);
        entity.setTerminationDate(terminationDate);
        entity.setBaseSalary(baseSalary);
        if (currency != null && !currency.isBlank()) {
            entity.setCurrency(currency);
        }
        entity.setNotes(notes);
    }
}
