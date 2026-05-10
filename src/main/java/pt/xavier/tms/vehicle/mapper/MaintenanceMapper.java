package pt.xavier.tms.vehicle.mapper;

import org.mapstruct.Mapper;
import pt.xavier.tms.vehicle.domain.MaintenanceRecord;
import pt.xavier.tms.vehicle.dto.MaintenanceRecordDto;

@Mapper(componentModel = "spring")
public interface MaintenanceMapper {

    MaintenanceRecordDto toDto(MaintenanceRecord entity);
}
