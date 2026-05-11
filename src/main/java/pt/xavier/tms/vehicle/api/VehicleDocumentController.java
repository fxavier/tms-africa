package pt.xavier.tms.vehicle.api;

import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pt.xavier.tms.shared.dto.ApiResponse;
import pt.xavier.tms.vehicle.dto.VehicleDocumentDto;
import pt.xavier.tms.vehicle.service.VehicleDocumentService;

@RestController
@RequestMapping("/api/v1/vehicles/{id}/documents")
public class VehicleDocumentController {

    private final VehicleDocumentService vehicleDocumentService;

    public VehicleDocumentController(VehicleDocumentService vehicleDocumentService) {
        this.vehicleDocumentService = vehicleDocumentService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR_FROTA','OPERADOR','AUDITOR')")
    public ResponseEntity<ApiResponse<List<VehicleDocumentDto>>> list(@PathVariable("id") UUID vehicleId) {
        return ResponseEntity.ok(ApiResponse.success(vehicleDocumentService.listDocuments(vehicleId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR_FROTA')")
    public ResponseEntity<ApiResponse<VehicleDocumentDto>> add(@PathVariable("id") UUID vehicleId,
            @RequestBody VehicleDocumentDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(vehicleDocumentService.addDocument(vehicleId, dto)));
    }

    @PutMapping("/{docId}")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR_FROTA')")
    public ResponseEntity<ApiResponse<VehicleDocumentDto>> update(@PathVariable("id") UUID vehicleId,
            @PathVariable UUID docId,
            @RequestBody VehicleDocumentDto dto) {
        return ResponseEntity.ok(ApiResponse.success(vehicleDocumentService.updateDocument(vehicleId, docId, dto)));
    }

    @DeleteMapping("/{docId}")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR_FROTA')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable("id") UUID vehicleId, @PathVariable UUID docId) {
        vehicleDocumentService.deleteDocument(vehicleId, docId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
