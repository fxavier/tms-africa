package pt.xavier.tms.hr.api;

import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
import pt.xavier.tms.hr.dto.EmployeeCreateDto;
import pt.xavier.tms.hr.dto.EmployeeResponseDto;
import pt.xavier.tms.hr.dto.EmployeeUpdateDto;
import pt.xavier.tms.hr.service.EmployeeService;
import pt.xavier.tms.shared.dto.ApiResponse;
import pt.xavier.tms.shared.dto.PagedResponse;
import pt.xavier.tms.shared.enums.EmployeeStatus;

@RestController
@RequestMapping("/api/v1/hr/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService service;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR_RH')")
    public ResponseEntity<ApiResponse<EmployeeResponseDto>> create(@Valid @RequestBody EmployeeCreateDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(service.createEmployee(dto)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR_RH','GESTOR_FROTA','AUDITOR')")
    public ResponseEntity<ApiResponse<PagedResponse<EmployeeResponseDto>>> list(
            @RequestParam(required = false) EmployeeStatus status,
            @RequestParam(required = false) UUID functionId,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<EmployeeResponseDto> result = service.listEmployees(status, functionId, q, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(new PagedResponse<>(result.getContent(), result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages())));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR_RH','GESTOR_FROTA','AUDITOR')")
    public ResponseEntity<ApiResponse<EmployeeResponseDto>> get(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(service.getEmployee(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR_RH')")
    public ResponseEntity<ApiResponse<EmployeeResponseDto>> update(@PathVariable UUID id, @RequestBody EmployeeUpdateDto dto) {
        return ResponseEntity.ok(ApiResponse.success(service.updateEmployee(id, dto)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR_RH')")
    public ResponseEntity<ApiResponse<EmployeeResponseDto>> updateStatus(@PathVariable UUID id,
            @RequestBody EmployeeStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success(service.updateStatus(id, request.status())));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR_RH')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        service.deleteEmployee(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    public record EmployeeStatusRequest(EmployeeStatus status) {
    }
}
