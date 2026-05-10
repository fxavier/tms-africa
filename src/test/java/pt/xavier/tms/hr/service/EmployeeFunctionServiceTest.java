package pt.xavier.tms.hr.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pt.xavier.tms.hr.dto.EmployeeFunctionCreateDto;
import pt.xavier.tms.hr.mapper.EmployeeFunctionMapper;
import pt.xavier.tms.hr.repository.EmployeeFunctionRepository;
import pt.xavier.tms.shared.exception.BusinessException;

@ExtendWith(MockitoExtension.class)
class EmployeeFunctionServiceTest {

    @Mock
    private EmployeeFunctionRepository repository;
    @Mock
    private EmployeeFunctionMapper mapper;

    @InjectMocks
    private EmployeeFunctionService service;

    @Test
    void createFunctionWithDuplicateCodeShouldThrowBusinessException() {
        when(repository.existsByCode("DRIVER")).thenReturn(true);

        assertThatThrownBy(() -> service.createFunction(new EmployeeFunctionCreateDto("DRIVER", "Driver", null)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("code already exists");
    }
}
