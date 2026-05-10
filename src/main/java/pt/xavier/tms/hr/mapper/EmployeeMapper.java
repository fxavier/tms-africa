package pt.xavier.tms.hr.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import pt.xavier.tms.hr.domain.Employee;
import pt.xavier.tms.hr.dto.EmployeeResponseDto;

@Mapper(componentModel = "spring")
public interface EmployeeMapper {
    @Mapping(target = "functionId", source = "function.id")
    @Mapping(target = "functionName", source = "function.name")
    EmployeeResponseDto toDto(Employee entity);
}
