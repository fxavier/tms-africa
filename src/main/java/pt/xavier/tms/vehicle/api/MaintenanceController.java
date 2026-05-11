package pt.xavier.tms.vehicle.api;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pt.xavier.tms.shared.dto.ApiResponse;
import pt.xavier.tms.shared.dto.PagedResponse;
import pt.xavier.tms.vehicle.dto.MaintenanceRecordDto;
import pt.xavier.tms.vehicle.service.MaintenanceService;

@Validated
@RestController
@RequestMapping("/api/v1/vehicles/{id}/maintenance")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR_FROTA','OPERADOR','AUDITOR')")
    public ResponseEntity<ApiResponse<PagedResponse<MaintenanceRecordDto>>> list(
            @PathVariable("id") UUID vehicleId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") @Min(10) @Max(100) int size) {
        Page<MaintenanceRecordDto> result = maintenanceService.listMaintenance(vehicleId, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(
                new PagedResponse<>(result.getContent(), result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages())));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR_FROTA')")
    public ResponseEntity<ApiResponse<MaintenanceRecordDto>> create(
            @PathVariable("id") UUID vehicleId,
            @RequestBody MaintenanceRecordDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(maintenanceService.registerMaintenance(vehicleId, dto)));
    }
}
