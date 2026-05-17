package pt.xavier.tms.catalog.api;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
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
import pt.xavier.tms.catalog.domain.CatalogCategory;
import pt.xavier.tms.catalog.dto.CatalogItemCreateDto;
import pt.xavier.tms.catalog.dto.CatalogItemDto;
import pt.xavier.tms.catalog.dto.CatalogItemUpdateDto;
import pt.xavier.tms.catalog.service.CatalogService;
import pt.xavier.tms.shared.dto.ApiResponse;

@RestController
@RequestMapping("/api/v1/catalog-items")
@RequiredArgsConstructor
public class CatalogItemController {

    private final CatalogService catalogService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR_FROTA','OPERADOR','AUDITOR','RH_INTEGRADOR')")
    public ResponseEntity<ApiResponse<List<CatalogItemDto>>> list(@RequestParam(required = false) CatalogCategory category) {
        return ResponseEntity.ok(ApiResponse.success(catalogService.list(category)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR_FROTA')")
    public ResponseEntity<ApiResponse<CatalogItemDto>> create(@Valid @RequestBody CatalogItemCreateDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(catalogService.create(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR_FROTA')")
    public ResponseEntity<ApiResponse<CatalogItemDto>> update(@PathVariable UUID id,
            @Valid @RequestBody CatalogItemUpdateDto dto) {
        return ResponseEntity.ok(ApiResponse.success(catalogService.update(id, dto)));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR_FROTA')")
    public ResponseEntity<ApiResponse<CatalogItemDto>> activate(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(catalogService.setActive(id, true)));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR_FROTA')")
    public ResponseEntity<ApiResponse<CatalogItemDto>> deactivate(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(catalogService.setActive(id, false)));
    }
}
