package pt.xavier.tms.driver.api;

import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pt.xavier.tms.driver.dto.DriverDocumentDto;
import pt.xavier.tms.driver.service.DriverDocumentService;
import pt.xavier.tms.shared.dto.ApiResponse;

@RestController
@RequestMapping("/api/v1/drivers/{id}/documents")
@RequiredArgsConstructor
public class DriverDocumentController {

    private final DriverDocumentService driverDocumentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR_FROTA','OPERADOR','AUDITOR')")
    public ResponseEntity<ApiResponse<List<DriverDocumentDto>>> list(@PathVariable("id") UUID driverId) {
        return ResponseEntity.ok(ApiResponse.success(driverDocumentService.listDocuments(driverId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR_FROTA')")
    public ResponseEntity<ApiResponse<DriverDocumentDto>> create(@PathVariable("id") UUID driverId,
            @RequestBody DriverDocumentDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(driverDocumentService.addDocument(driverId, dto)));
    }

    @PutMapping("/{docId}")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR_FROTA')")
    public ResponseEntity<ApiResponse<DriverDocumentDto>> update(@PathVariable("id") UUID driverId,
            @PathVariable UUID docId,
            @RequestBody DriverDocumentDto dto) {
        return ResponseEntity.ok(ApiResponse.success(driverDocumentService.updateDocument(driverId, docId, dto)));
    }
}
