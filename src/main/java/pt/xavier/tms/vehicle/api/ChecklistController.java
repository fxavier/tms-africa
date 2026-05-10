package pt.xavier.tms.vehicle.api;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pt.xavier.tms.shared.dto.ApiResponse;
import pt.xavier.tms.shared.dto.PagedResponse;
import pt.xavier.tms.vehicle.dto.ChecklistInspectionDto;
import pt.xavier.tms.vehicle.dto.ChecklistTemplateDto;
import pt.xavier.tms.vehicle.service.ChecklistService;

@Validated
@RestController
public class ChecklistController {

    private final ChecklistService checklistService;

    public ChecklistController(ChecklistService checklistService) {
        this.checklistService = checklistService;
    }

    @GetMapping("/api/v1/vehicles/{id}/checklists")
    public ResponseEntity<ApiResponse<PagedResponse<ChecklistInspectionDto>>> listVehicleChecklists(
            @PathVariable("id") UUID vehicleId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") @Min(10) @Max(100) int size) {
        Page<ChecklistInspectionDto> result = checklistService.listChecklists(vehicleId, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(
                new PagedResponse<>(result.getContent(), result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages())));
    }

    @PostMapping("/api/v1/vehicles/{id}/checklists")
    public ResponseEntity<ApiResponse<ChecklistInspectionDto>> submitChecklist(
            @PathVariable("id") UUID vehicleId,
            @RequestBody ChecklistInspectionDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(checklistService.submitChecklist(vehicleId, dto)));
    }

    @GetMapping("/api/v1/checklist-templates")
    public ResponseEntity<ApiResponse<List<ChecklistTemplateDto>>> listTemplates(
            @RequestParam(required = false) String vehicleType) {
        return ResponseEntity.ok(ApiResponse.success(checklistService.listTemplates(vehicleType)));
    }

    @PostMapping("/api/v1/checklist-templates")
    public ResponseEntity<ApiResponse<ChecklistTemplateDto>> createTemplate(@RequestBody ChecklistTemplateDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(checklistService.createTemplate(dto)));
    }

    @PutMapping("/api/v1/checklist-templates/{id}")
    public ResponseEntity<ApiResponse<ChecklistTemplateDto>> updateTemplate(@PathVariable UUID id,
            @RequestBody ChecklistTemplateDto dto) {
        return ResponseEntity.ok(ApiResponse.success(checklistService.updateTemplate(id, dto)));
    }
}
