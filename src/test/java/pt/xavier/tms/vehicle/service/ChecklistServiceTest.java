package pt.xavier.tms.vehicle.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pt.xavier.tms.shared.enums.ChecklistItemStatus;
import pt.xavier.tms.vehicle.domain.ChecklistInspection;
import pt.xavier.tms.vehicle.domain.ChecklistInspectionItem;
import pt.xavier.tms.vehicle.domain.ChecklistTemplate;
import pt.xavier.tms.vehicle.domain.Vehicle;
import pt.xavier.tms.vehicle.dto.ChecklistInspectionDto;
import pt.xavier.tms.vehicle.dto.ChecklistInspectionItemDto;
import pt.xavier.tms.vehicle.mapper.ChecklistMapper;
import pt.xavier.tms.vehicle.repository.ChecklistInspectionRepository;
import pt.xavier.tms.vehicle.repository.ChecklistTemplateItemRepository;
import pt.xavier.tms.vehicle.repository.ChecklistTemplateRepository;
import pt.xavier.tms.vehicle.repository.VehicleRepository;

@ExtendWith(MockitoExtension.class)
class ChecklistServiceTest {

    @Mock private VehicleRepository vehicleRepository;
    @Mock private ChecklistTemplateRepository checklistTemplateRepository;
    @Mock private ChecklistTemplateItemRepository checklistTemplateItemRepository;
    @Mock private ChecklistInspectionRepository checklistInspectionRepository;
    @Mock private ChecklistMapper checklistMapper;

    @InjectMocks
    private ChecklistService checklistService;

    @Test
    void submitChecklistWithCriticalFailureShouldReturnTrue() {
        UUID vehicleId = UUID.randomUUID();
        UUID templateId = UUID.randomUUID();
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(new Vehicle()));
        ChecklistTemplate template = new ChecklistTemplate();
        template.setId(templateId);
        when(checklistTemplateRepository.findById(templateId)).thenReturn(Optional.of(template));

        when(checklistInspectionRepository.save(any(ChecklistInspection.class))).thenAnswer(inv -> inv.getArgument(0));
        when(checklistMapper.toInspectionDto(any(ChecklistInspection.class))).thenAnswer(inv -> {
            ChecklistInspection inspection = inv.getArgument(0);
            return new ChecklistInspectionDto(null, null, templateId, "system", null, null, List.of(), inspection.hasCriticalFailures());
        });

        ChecklistInspectionDto input = new ChecklistInspectionDto(
                null,
                null,
                templateId,
                "system",
                Instant.now(),
                "check",
                List.of(new ChecklistInspectionItemDto(null, "Pneus", true, ChecklistItemStatus.AVARIA, "damaged")),
                false);

        ChecklistInspectionDto result = checklistService.submitChecklist(vehicleId, input);

        assertThat(result.criticalFailures()).isTrue();
    }

    @Test
    void submitChecklistWithoutCriticalFailureShouldReturnFalse() {
        UUID vehicleId = UUID.randomUUID();
        UUID templateId = UUID.randomUUID();
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(new Vehicle()));
        ChecklistTemplate template = new ChecklistTemplate();
        template.setId(templateId);
        when(checklistTemplateRepository.findById(templateId)).thenReturn(Optional.of(template));

        when(checklistInspectionRepository.save(any(ChecklistInspection.class))).thenAnswer(inv -> inv.getArgument(0));
        when(checklistMapper.toInspectionDto(any(ChecklistInspection.class))).thenAnswer(inv -> {
            ChecklistInspection inspection = inv.getArgument(0);
            return new ChecklistInspectionDto(null, null, templateId, "system", null, null, List.of(), inspection.hasCriticalFailures());
        });

        ChecklistInspectionDto input = new ChecklistInspectionDto(
                null,
                null,
                templateId,
                "system",
                Instant.now(),
                "ok",
                List.of(new ChecklistInspectionItemDto(null, "Luzes", true, ChecklistItemStatus.OK, "ok")),
                false);

        ChecklistInspectionDto result = checklistService.submitChecklist(vehicleId, input);

        assertThat(result.criticalFailures()).isFalse();
    }
}
