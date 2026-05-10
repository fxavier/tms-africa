package pt.xavier.tms.vehicle.mapper;

import java.util.UUID;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import pt.xavier.tms.vehicle.domain.VehicleDocument;
import pt.xavier.tms.vehicle.dto.VehicleDocumentDto;

@Mapper(componentModel = "spring")
public interface VehicleDocumentMapper {

    @Mapping(target = "fileId", expression = "java(fileId(entity))")
    VehicleDocumentDto toDto(VehicleDocument entity);

    default UUID fileId(VehicleDocument entity) {
        if (entity == null || entity.getFile() == null) {
            return null;
        }
        return entity.getFile().getId();
    }
}
