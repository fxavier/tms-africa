package pt.xavier.tms.hr.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pt.xavier.tms.hr.dto.EmployeeCreateDto;
import pt.xavier.tms.hr.mapper.EmployeeMapper;
import pt.xavier.tms.hr.repository.EmployeeRepository;
import pt.xavier.tms.shared.enums.EmployeeStatus;
import pt.xavier.tms.shared.exception.BusinessException;
import pt.xavier.tms.shared.exception.ResourceNotFoundException;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository repository;
    @Mock
    private EmployeeFunctionService functionService;
    @Mock
    private EmployeeMapper mapper;

    @InjectMocks
    private EmployeeService service;

    @Test
    void createEmployeeWithDuplicateNumberShouldThrowBusinessException() {
        when(repository.existsByEmployeeNumber("EMP-001")).thenReturn(true);

        EmployeeCreateDto dto = new EmployeeCreateDto("EMP-001", "Alice", null, null, null,
                null, EmployeeStatus.ACTIVE, null, null, null, "MZN", null);

        assertThatThrownBy(() -> service.createEmployee(dto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("number already exists");
    }

    @Test
    void createEmployeeWithMissingFunctionShouldThrowNotFound() {
        when(repository.existsByEmployeeNumber("EMP-002")).thenReturn(false);
        UUID functionId = UUID.randomUUID();
        when(functionService.getEntity(functionId))
                .thenThrow(new ResourceNotFoundException("EMPLOYEE_FUNCTION_NOT_FOUND", "not found"));

        EmployeeCreateDto dto = new EmployeeCreateDto("EMP-002", "Bob", null, null, null,
                functionId, EmployeeStatus.ACTIVE, null, null, null, "MZN", null);

        assertThatThrownBy(() -> service.createEmployee(dto))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
