package pt.xavier.tms.hr.service;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.xavier.tms.hr.domain.EmployeeFunction;
import pt.xavier.tms.hr.dto.EmployeeFunctionCreateDto;
import pt.xavier.tms.hr.dto.EmployeeFunctionResponseDto;
import pt.xavier.tms.hr.dto.EmployeeFunctionUpdateDto;
import pt.xavier.tms.hr.mapper.EmployeeFunctionMapper;
import pt.xavier.tms.hr.repository.EmployeeFunctionRepository;
import pt.xavier.tms.shared.exception.BusinessException;
import pt.xavier.tms.shared.exception.ResourceNotFoundException;

@Service
@RequiredArgsConstructor
public class EmployeeFunctionService {

    private final EmployeeFunctionRepository repository;
    private final EmployeeFunctionMapper mapper;

    @Transactional
    public EmployeeFunctionResponseDto createFunction(EmployeeFunctionCreateDto dto) {
        if (repository.existsByCode(dto.code())) {
            throw new BusinessException("FUNCTION_CODE_ALREADY_EXISTS", "Function code already exists");
        }
        EmployeeFunction entity = new EmployeeFunction();
        entity.setId(UUID.randomUUID());
        entity.setCode(dto.code());
        entity.setName(dto.name());
        entity.setDescription(dto.description());
        entity.setActive(true);
        return mapper.toDto(repository.save(entity));
    }

    @Transactional
    public EmployeeFunctionResponseDto updateFunction(UUID id, EmployeeFunctionUpdateDto dto) {
        EmployeeFunction entity = getEntity(id);
        entity.setName(dto.name());
        entity.setDescription(dto.description());
        return mapper.toDto(repository.save(entity));
    }

    @Transactional
    public void activate(UUID id) {
        EmployeeFunction entity = getEntity(id);
        entity.setActive(true);
        repository.save(entity);
    }

    @Transactional
    public void deactivate(UUID id) {
        EmployeeFunction entity = getEntity(id);
        entity.setActive(false);
        repository.save(entity);
    }

    @Transactional(readOnly = true)
    public Page<EmployeeFunctionResponseDto> listFunctions(Pageable pageable) {
        return repository.findAll(pageable).map(mapper::toDto);
    }

    @Transactional(readOnly = true)
    public EmployeeFunctionResponseDto getFunction(UUID id) {
        return mapper.toDto(getEntity(id));
    }

    @Transactional(readOnly = true)
    public EmployeeFunction getEntity(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EMPLOYEE_FUNCTION_NOT_FOUND", "Employee function not found"));
    }
}
