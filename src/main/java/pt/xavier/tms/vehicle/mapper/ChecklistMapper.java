package pt.xavier.tms.vehicle.mapper;

import java.util.List;
import java.util.UUID;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import pt.xavier.tms.vehicle.domain.ChecklistInspection;
import pt.xavier.tms.vehicle.domain.ChecklistInspectionItem;
import pt.xavier.tms.vehicle.domain.ChecklistTemplate;
import pt.xavier.tms.vehicle.domain.ChecklistTemplateItem;
import pt.xavier.tms.vehicle.domain.VehicleAccessory;
import pt.xavier.tms.vehicle.dto.ChecklistInspectionDto;
import pt.xavier.tms.vehicle.dto.ChecklistInspectionItemDto;
import pt.xavier.tms.vehicle.dto.ChecklistTemplateDto;
import pt.xavier.tms.vehicle.dto.ChecklistTemplateItemDto;
import pt.xavier.tms.vehicle.dto.VehicleAccessoryDto;

@Mapper(componentModel = "spring")
public interface ChecklistMapper {

    @Mapping(target = "templateId", expression = "java(templateId(entity))")
    @Mapping(target = "criticalFailures", expression = "java(entity.hasCriticalFailures())")
    ChecklistInspectionDto toInspectionDto(ChecklistInspection entity);

    @Mapping(target = "templateItemId", expression = "java(templateItemId(entity))")
    ChecklistInspectionItemDto toInspectionItemDto(ChecklistInspectionItem entity);

    List<ChecklistInspectionItemDto> toInspectionItems(List<ChecklistInspectionItem> entities);

    ChecklistTemplateDto toTemplateDto(ChecklistTemplate entity);

    ChecklistTemplateItemDto toTemplateItemDto(ChecklistTemplateItem entity);

    List<ChecklistTemplateItemDto> toTemplateItems(List<ChecklistTemplateItem> entities);

    VehicleAccessoryDto toAccessoryDto(VehicleAccessory entity);

    List<VehicleAccessoryDto> toAccessoryDtos(List<VehicleAccessory> entities);

    default UUID templateId(ChecklistInspection entity) {
        if (entity == null || entity.getTemplate() == null) {
            return null;
        }
        return entity.getTemplate().getId();
    }

    default UUID templateItemId(ChecklistInspectionItem entity) {
        if (entity == null || entity.getTemplateItem() == null) {
            return null;
        }
        return entity.getTemplateItem().getId();
    }
}
