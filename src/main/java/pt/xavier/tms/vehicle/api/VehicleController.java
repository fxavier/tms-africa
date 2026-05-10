package pt.xavier.tms.vehicle.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pt.xavier.tms.shared.dto.ApiResponse;
import pt.xavier.tms.shared.dto.PagedResponse;
import pt.xavier.tms.shared.enums.VehicleStatus;
import pt.xavier.tms.vehicle.dto.VehicleConsolidatedDto;
import pt.xavier.tms.vehicle.dto.VehicleCreateDto;
import pt.xavier.tms.vehicle.dto.VehicleResponseDto;
import pt.xavier.tms.vehicle.dto.VehicleUpdateDto;
import pt.xavier.tms.vehicle.service.VehicleService;

@Validated
@RestController
@RequestMapping("/api/v1/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VehicleResponseDto>> createVehicle(@Valid @RequestBody VehicleCreateDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(vehicleService.createVehicle(dto)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<VehicleResponseDto>>> listVehicles(
            @RequestParam(required = false) VehicleStatus status,
            @RequestParam(required = false) String location,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") @Min(10) @Max(100) int size) {
        Page<VehicleResponseDto> result = vehicleService.listVehicles(status, location, pageRequest(page, size));
        return ResponseEntity.ok(ApiResponse.success(toPagedResponse(result)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PagedResponse<VehicleResponseDto>>> searchVehicles(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") @Min(10) @Max(100) int size) {
        Page<VehicleResponseDto> result = vehicleService.searchByPlate(q, pageRequest(page, size));
        return ResponseEntity.ok(ApiResponse.success(toPagedResponse(result)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleResponseDto>> getVehicle(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(vehicleService.getVehicle(id)));
    }

    @GetMapping("/{id}/consolidated")
    public ResponseEntity<ApiResponse<VehicleConsolidatedDto>> getConsolidated(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(vehicleService.getConsolidated(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleResponseDto>> updateVehicle(@PathVariable UUID id,
            @Valid @RequestBody VehicleUpdateDto dto) {
        return ResponseEntity.ok(ApiResponse.success(vehicleService.updateVehicle(id, dto)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<VehicleResponseDto>> updateStatus(@PathVariable UUID id,
            @Valid @RequestBody VehicleStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success(vehicleService.updateStatus(id, request.status())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteVehicle(@PathVariable UUID id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    private Pageable pageRequest(int page, int size) {
        return PageRequest.of(page, size);
    }

    private PagedResponse<VehicleResponseDto> toPagedResponse(Page<VehicleResponseDto> page) {
        return new PagedResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages());
    }

    public record VehicleStatusRequest(VehicleStatus status) {
    }
}
