package pt.xavier.tms.driver.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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
import pt.xavier.tms.driver.dto.DriverCreateDto;
import pt.xavier.tms.driver.dto.DriverResponseDto;
import pt.xavier.tms.driver.dto.DriverUpdateDto;
import pt.xavier.tms.driver.service.DriverService;
import pt.xavier.tms.integration.dto.DriverAvailabilityDto;
import pt.xavier.tms.shared.dto.ApiResponse;
import pt.xavier.tms.shared.dto.PagedResponse;
import pt.xavier.tms.shared.enums.DriverStatus;

@Validated
@RestController
@RequestMapping("/api/v1/drivers")
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;

    @PostMapping
    public ResponseEntity<ApiResponse<DriverResponseDto>> create(@Valid @RequestBody DriverCreateDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(driverService.createDriver(dto)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<DriverResponseDto>>> list(
            @RequestParam(required = false) DriverStatus status,
            @RequestParam(required = false) String location,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") @Min(10) @Max(100) int size) {
        Page<DriverResponseDto> result = driverService.listDrivers(status, location, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(
                new PagedResponse<>(result.getContent(), result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DriverResponseDto>> get(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(driverService.getDriver(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DriverResponseDto>> update(@PathVariable UUID id, @RequestBody DriverUpdateDto dto) {
        return ResponseEntity.ok(ApiResponse.success(driverService.updateDriver(id, dto)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<DriverResponseDto>> updateStatus(@PathVariable UUID id,
            @RequestBody DriverStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success(driverService.updateStatus(id, request.status())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        driverService.deleteDriver(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<ApiResponse<DriverAvailabilityDto>> getAvailability(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(driverService.getAvailability(id)));
    }

    public record DriverStatusRequest(DriverStatus status) {
    }
}
