package pt.xavier.tms.vehicle.service;

import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.xavier.tms.audit.annotation.Auditable;
import pt.xavier.tms.shared.enums.AuditOperation;
import pt.xavier.tms.shared.exception.ResourceNotFoundException;
import pt.xavier.tms.vehicle.domain.ChecklistInspection;
import pt.xavier.tms.vehicle.domain.ChecklistInspectionItem;
import pt.xavier.tms.vehicle.domain.ChecklistTemplate;
import pt.xavier.tms.vehicle.domain.ChecklistTemplateItem;
import pt.xavier.tms.vehicle.domain.Vehicle;
import pt.xavier.tms.vehicle.dto.ChecklistInspectionDto;
import pt.xavier.tms.vehicle.dto.ChecklistInspectionItemDto;
import pt.xavier.tms.vehicle.dto.ChecklistTemplateDto;
import pt.xavier.tms.vehicle.dto.ChecklistTemplateItemDto;
import pt.xavier.tms.vehicle.repository.ChecklistInspectionRepository;
import pt.xavier.tms.vehicle.repository.ChecklistTemplateItemRepository;
import pt.xavier.tms.vehicle.repository.ChecklistTemplateRepository;
import pt.xavier.tms.vehicle.repository.VehicleRepository;

@Service
@RequiredArgsConstructor
public class ChecklistService {

    private final VehicleRepository vehicleRepository;
    private final ChecklistTemplateRepository checklistTemplateRepository;
    private final ChecklistTemplateItemRepository checklistTemplateItemRepository;
    private final ChecklistInspectionRepository checklistInspectionRepository;

    @Transactional
    @Auditable(entityType = "CHECKLIST_INSPECTION", operation = AuditOperation.CRIACAO)
    public ChecklistInspectionDto submitChecklist(UUID vehicleId, ChecklistInspectionDto dto) {
        Vehicle vehicle = getVehicle(vehicleId);
        ChecklistTemplate template = getTemplateEntity(dto.templateId());

        ChecklistInspection inspection = new ChecklistInspection();
        inspection.setId(UUID.randomUUID());
        inspection.setVehicle(vehicle);
        inspection.setActivityId(dto.activityId());
        inspection.setTemplate(template);
        inspection.setPerformedBy(dto.performedBy());
        inspection.setPerformedAt(dto.performedAt());
        inspection.setNotes(dto.notes());

        List<ChecklistInspectionItem> items = dto.items().stream().map(itemDto -> {
            ChecklistInspectionItem item = new ChecklistInspectionItem();
            item.setId(UUID.randomUUID());
            item.setInspection(inspection);
            if (itemDto.templateItemId() != null) {
                item.setTemplateItem(checklistTemplateItemRepository.findById(itemDto.templateItemId()).orElse(null));
            }
            item.setItemName(itemDto.itemName());
            item.setCritical(itemDto.critical());
            item.setStatus(itemDto.status());
            item.setNotes(itemDto.notes());
            return item;
        }).toList();
        inspection.setItems(items);

        ChecklistInspection saved = checklistInspectionRepository.save(inspection);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public Page<ChecklistInspectionDto> listChecklists(UUID vehicleId, Pageable pageable) {
        getVehicle(vehicleId);
        return checklistInspectionRepository.findAll(pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public List<ChecklistTemplateDto> listTemplates(String vehicleType) {
        if (vehicleType == null || vehicleType.isBlank()) {
            return checklistTemplateRepository.findAll().stream().map(this::toTemplateDto).toList();
        }
        return checklistTemplateRepository.findByVehicleTypeAndActiveTrue(vehicleType).stream().map(this::toTemplateDto).toList();
    }

    @Transactional(readOnly = true)
    public ChecklistTemplateDto getTemplate(UUID templateId) {
        return toTemplateDto(getTemplateEntity(templateId));
    }

    @Transactional
    @Auditable(entityType = "CHECKLIST_TEMPLATE", operation = AuditOperation.CRIACAO)
    public ChecklistTemplateDto createTemplate(ChecklistTemplateDto dto) {
        ChecklistTemplate template = new ChecklistTemplate();
        template.setId(UUID.randomUUID());
        template.setVehicleType(dto.vehicleType());
        template.setName(dto.name());
        template.setActive(dto.active());

        List<ChecklistTemplateItem> items = dto.items() == null ? List.of() : dto.items().stream().map(i -> {
            ChecklistTemplateItem item = new ChecklistTemplateItem();
            item.setId(UUID.randomUUID());
            item.setTemplate(template);
            item.setItemName(i.itemName());
            item.setCritical(i.critical());
            item.setDisplayOrder(i.displayOrder());
            return item;
        }).toList();
        template.setItems(items);

        return toTemplateDto(checklistTemplateRepository.save(template));
    }

    @Transactional
    @Auditable(entityType = "CHECKLIST_TEMPLATE", operation = AuditOperation.ATUALIZACAO)
    public ChecklistTemplateDto updateTemplate(UUID templateId, ChecklistTemplateDto dto) {
        ChecklistTemplate template = getTemplateEntity(templateId);
        template.setVehicleType(dto.vehicleType());
        template.setName(dto.name());
        template.setActive(dto.active());
        return toTemplateDto(checklistTemplateRepository.save(template));
    }

    private Vehicle getVehicle(UUID vehicleId) {
        return vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("VEHICLE_NOT_FOUND", "Vehicle not found"));
    }

    private ChecklistTemplate getTemplateEntity(UUID templateId) {
        return checklistTemplateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("CHECKLIST_TEMPLATE_NOT_FOUND", "Checklist template not found"));
    }

    private ChecklistInspectionDto toDto(ChecklistInspection inspection) {
        List<ChecklistInspectionItemDto> items = inspection.getItems().stream()
                .map(i -> new ChecklistInspectionItemDto(
                        i.getTemplateItem() == null ? null : i.getTemplateItem().getId(),
                        i.getItemName(),
                        i.isCritical(),
                        i.getStatus(),
                        i.getNotes()))
                .toList();

        return new ChecklistInspectionDto(
                inspection.getId(),
                inspection.getActivityId(),
                inspection.getTemplate().getId(),
                inspection.getPerformedBy(),
                inspection.getPerformedAt(),
                inspection.getNotes(),
                items,
                inspection.hasCriticalFailures()
        );
    }

    private ChecklistTemplateDto toTemplateDto(ChecklistTemplate template) {
        List<ChecklistTemplateItemDto> items = template.getItems().stream()
                .map(i -> new ChecklistTemplateItemDto(i.getId(), i.getItemName(), i.isCritical(), i.getDisplayOrder()))
                .toList();
        return new ChecklistTemplateDto(template.getId(), template.getVehicleType(), template.getName(), template.isActive(), items);
    }
}
