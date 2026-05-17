package pt.xavier.tms.vehicle.service;

import java.util.List;
import java.util.UUID;
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
import pt.xavier.tms.vehicle.dto.ChecklistTemplateDto;
import pt.xavier.tms.vehicle.mapper.ChecklistMapper;
import pt.xavier.tms.vehicle.repository.ChecklistInspectionRepository;
import pt.xavier.tms.vehicle.repository.ChecklistTemplateItemRepository;
import pt.xavier.tms.vehicle.repository.ChecklistTemplateRepository;
import pt.xavier.tms.vehicle.repository.VehicleRepository;

@Service
public class ChecklistService {

    private final VehicleRepository vehicleRepository;
    private final ChecklistTemplateRepository checklistTemplateRepository;
    private final ChecklistTemplateItemRepository checklistTemplateItemRepository;
    private final ChecklistInspectionRepository checklistInspectionRepository;
    private final ChecklistMapper checklistMapper;

    public ChecklistService(
            VehicleRepository vehicleRepository,
            ChecklistTemplateRepository checklistTemplateRepository,
            ChecklistTemplateItemRepository checklistTemplateItemRepository,
            ChecklistInspectionRepository checklistInspectionRepository,
            ChecklistMapper checklistMapper) {
        this.vehicleRepository = vehicleRepository;
        this.checklistTemplateRepository = checklistTemplateRepository;
        this.checklistTemplateItemRepository = checklistTemplateItemRepository;
        this.checklistInspectionRepository = checklistInspectionRepository;
        this.checklistMapper = checklistMapper;
    }

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
        return checklistMapper.toInspectionDto(saved);
    }

    @Transactional(readOnly = true)
    public Page<ChecklistInspectionDto> listChecklists(UUID vehicleId, Pageable pageable) {
        getVehicle(vehicleId);
        return checklistInspectionRepository.findByVehicle_Id(vehicleId, pageable).map(checklistMapper::toInspectionDto);
    }

    @Transactional(readOnly = true)
    public ChecklistInspectionDto getChecklist(UUID vehicleId, UUID checklistId) {
        getVehicle(vehicleId);
        return checklistMapper.toInspectionDto(checklistInspectionRepository.findByIdAndVehicle_Id(checklistId, vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("CHECKLIST_NOT_FOUND", "Checklist inspection not found for vehicle")));
    }

    @Transactional(readOnly = true)
    public List<ChecklistTemplateDto> listTemplates(String vehicleType) {
        if (vehicleType == null || vehicleType.isBlank()) {
            return checklistTemplateRepository.findAll().stream().map(checklistMapper::toTemplateDto).toList();
        }
        return checklistTemplateRepository.findByVehicleTypeAndActiveTrue(vehicleType).stream().map(checklistMapper::toTemplateDto).toList();
    }

    @Transactional(readOnly = true)
    public ChecklistTemplateDto getTemplate(UUID templateId) {
        return checklistMapper.toTemplateDto(getTemplateEntity(templateId));
    }

    @Transactional
    @Auditable(entityType = "CHECKLIST_TEMPLATE", operation = AuditOperation.CRIACAO)
    public ChecklistTemplateDto createTemplate(ChecklistTemplateDto dto) {
        ChecklistTemplate template = new ChecklistTemplate();
        template.setId(UUID.randomUUID());
        template.setVehicleType(dto.vehicleType());
        template.setName(dto.name());
        template.setActive(dto.active());

        template.setItems(toTemplateItems(template, dto));

        return checklistMapper.toTemplateDto(checklistTemplateRepository.save(template));
    }

    @Transactional
    @Auditable(entityType = "CHECKLIST_TEMPLATE", operation = AuditOperation.ATUALIZACAO)
    public ChecklistTemplateDto updateTemplate(UUID templateId, ChecklistTemplateDto dto) {
        ChecklistTemplate template = getTemplateEntity(templateId);
        template.setVehicleType(dto.vehicleType());
        template.setName(dto.name());
        template.setActive(dto.active());
        template.getItems().clear();
        template.getItems().addAll(toTemplateItems(template, dto));
        return checklistMapper.toTemplateDto(checklistTemplateRepository.save(template));
    }

    private List<ChecklistTemplateItem> toTemplateItems(ChecklistTemplate template, ChecklistTemplateDto dto) {
        return dto.items() == null ? List.of() : dto.items().stream().map(i -> {
            ChecklistTemplateItem item = new ChecklistTemplateItem();
            item.setId(UUID.randomUUID());
            item.setTemplate(template);
            item.setItemName(i.itemName());
            item.setCritical(i.critical());
            item.setDisplayOrder(i.displayOrder());
            return item;
        }).toList();
    }

    private Vehicle getVehicle(UUID vehicleId) {
        return vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("VEHICLE_NOT_FOUND", "Vehicle not found"));
    }

    private ChecklistTemplate getTemplateEntity(UUID templateId) {
        return checklistTemplateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("CHECKLIST_TEMPLATE_NOT_FOUND", "Checklist template not found"));
    }
}
