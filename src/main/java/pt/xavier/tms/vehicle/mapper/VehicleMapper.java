package pt.xavier.tms.vehicle.mapper;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;
import pt.xavier.tms.vehicle.domain.Vehicle;
import pt.xavier.tms.vehicle.dto.VehicleCreateDto;
import pt.xavier.tms.vehicle.dto.VehicleResponseDto;
import pt.xavier.tms.vehicle.dto.VehicleUpdateDto;

@Mapper(componentModel = "spring")
public interface VehicleMapper {

    VehicleResponseDto toResponseDto(Vehicle entity);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    Vehicle toEntity(VehicleCreateDto dto);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    void updateEntity(VehicleUpdateDto dto, @MappingTarget Vehicle entity);
}
