package pt.xavier.tms.hr.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import pt.xavier.tms.hr.domain.SalaryPayment;
import pt.xavier.tms.hr.dto.SalaryPaymentResponseDto;

@Mapper(componentModel = "spring")
public interface SalaryPaymentMapper {
    @Mapping(target = "employeeId", source = "employee.id")
    SalaryPaymentResponseDto toDto(SalaryPayment entity);
}
