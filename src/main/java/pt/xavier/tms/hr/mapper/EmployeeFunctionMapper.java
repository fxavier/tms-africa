package pt.xavier.tms.hr.mapper;

import org.mapstruct.Mapper;
import pt.xavier.tms.hr.domain.EmployeeFunction;
import pt.xavier.tms.hr.dto.EmployeeFunctionResponseDto;

@Mapper(componentModel = "spring")
public interface EmployeeFunctionMapper {
    EmployeeFunctionResponseDto toDto(EmployeeFunction entity);
}
