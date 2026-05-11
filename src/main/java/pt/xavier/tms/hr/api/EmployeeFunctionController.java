package pt.xavier.tms.hr.api;

import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pt.xavier.tms.hr.dto.EmployeeFunctionCreateDto;
import pt.xavier.tms.hr.dto.EmployeeFunctionResponseDto;
import pt.xavier.tms.hr.dto.EmployeeFunctionUpdateDto;
import pt.xavier.tms.hr.service.EmployeeFunctionService;
import pt.xavier.tms.shared.dto.ApiResponse;
import pt.xavier.tms.shared.dto.PagedResponse;

@RestController
@RequestMapping("/api/v1/hr/functions")
@RequiredArgsConstructor
public class EmployeeFunctionController {

    private final EmployeeFunctionService service;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR_RH')")
    public ResponseEntity<ApiResponse<EmployeeFunctionResponseDto>> create(@Valid @RequestBody EmployeeFunctionCreateDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(service.createFunction(dto)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR_RH','GESTOR_FROTA','AUDITOR')")
    public ResponseEntity<ApiResponse<PagedResponse<EmployeeFunctionResponseDto>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<EmployeeFunctionResponseDto> result = service.listFunctions(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(new PagedResponse<>(result.getContent(), result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages())));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR_RH','GESTOR_FROTA','AUDITOR')")
    public ResponseEntity<ApiResponse<EmployeeFunctionResponseDto>> get(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(service.getFunction(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR_RH')")
    public ResponseEntity<ApiResponse<EmployeeFunctionResponseDto>> update(@PathVariable UUID id,
            @Valid @RequestBody EmployeeFunctionUpdateDto dto) {
        return ResponseEntity.ok(ApiResponse.success(service.updateFunction(id, dto)));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR_RH')")
    public ResponseEntity<ApiResponse<Void>> activate(@PathVariable UUID id) {
        service.activate(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR_RH')")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable UUID id) {
        service.deactivate(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
