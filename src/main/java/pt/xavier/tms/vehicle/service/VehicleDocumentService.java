package pt.xavier.tms.vehicle.service;

import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.xavier.tms.audit.annotation.Auditable;
import pt.xavier.tms.catalog.domain.CatalogCategory;
import pt.xavier.tms.catalog.service.CatalogService;
import pt.xavier.tms.shared.enums.AuditOperation;
import pt.xavier.tms.shared.enums.DocumentStatus;
import pt.xavier.tms.shared.exception.ResourceNotFoundException;
import pt.xavier.tms.vehicle.domain.FileRecord;
import pt.xavier.tms.vehicle.domain.Vehicle;
import pt.xavier.tms.vehicle.domain.VehicleDocument;
import pt.xavier.tms.vehicle.dto.VehicleDocumentDto;
import pt.xavier.tms.vehicle.mapper.VehicleDocumentMapper;
import pt.xavier.tms.vehicle.repository.FileRecordRepository;
import pt.xavier.tms.vehicle.repository.VehicleDocumentRepository;
import pt.xavier.tms.vehicle.repository.VehicleRepository;

@Service
public class VehicleDocumentService {

    private final VehicleRepository vehicleRepository;
    private final VehicleDocumentRepository vehicleDocumentRepository;
    private final FileRecordRepository fileRecordRepository;
    private final VehicleDocumentMapper vehicleDocumentMapper;
    private final CatalogService catalogService;

    public VehicleDocumentService(
            VehicleRepository vehicleRepository,
            VehicleDocumentRepository vehicleDocumentRepository,
            FileRecordRepository fileRecordRepository,
            VehicleDocumentMapper vehicleDocumentMapper,
            CatalogService catalogService) {
        this.vehicleRepository = vehicleRepository;
        this.vehicleDocumentRepository = vehicleDocumentRepository;
        this.fileRecordRepository = fileRecordRepository;
        this.vehicleDocumentMapper = vehicleDocumentMapper;
        this.catalogService = catalogService;
    }

    @Transactional
    @Auditable(entityType = "VEHICLE_DOCUMENT", operation = AuditOperation.CRIACAO)
    public VehicleDocumentDto addDocument(UUID vehicleId, VehicleDocumentDto dto) {
        Vehicle vehicle = getVehicle(vehicleId);
        VehicleDocument document = new VehicleDocument();
        document.setId(UUID.randomUUID());
        document.setVehicle(vehicle);
        catalogService.requireActiveCode(CatalogCategory.VEHICLE_DOCUMENT, dto.documentType());
        document.setDocumentType(dto.documentType());
        document.setDocumentNumber(dto.documentNumber());
        document.setIssueDate(dto.issueDate());
        document.setExpiryDate(dto.expiryDate());
        document.setIssuingEntity(dto.issuingEntity());
        document.setStatus(dto.status() == null ? DocumentStatus.VALIDO : dto.status());
        document.setNotes(dto.notes());
        if (dto.fileId() != null) {
            document.setFile(getFile(dto.fileId()));
        }
        return vehicleDocumentMapper.toDto(vehicleDocumentRepository.save(document));
    }

    @Transactional
    @Auditable(entityType = "VEHICLE_DOCUMENT", operation = AuditOperation.ATUALIZACAO)
    public VehicleDocumentDto updateDocument(UUID vehicleId, UUID docId, VehicleDocumentDto dto) {
        getVehicle(vehicleId);
        VehicleDocument document = vehicleDocumentRepository.findById(docId)
                .orElseThrow(() -> new ResourceNotFoundException("VEHICLE_DOCUMENT_NOT_FOUND", "Vehicle document not found"));
        catalogService.requireActiveCode(CatalogCategory.VEHICLE_DOCUMENT, dto.documentType());
        document.setDocumentType(dto.documentType());
        document.setDocumentNumber(dto.documentNumber());
        document.setIssueDate(dto.issueDate());
        document.setExpiryDate(dto.expiryDate());
        document.setIssuingEntity(dto.issuingEntity());
        document.setStatus(dto.status() == null ? DocumentStatus.VALIDO : dto.status());
        document.setNotes(dto.notes());
        document.setFile(dto.fileId() == null ? null : getFile(dto.fileId()));
        return vehicleDocumentMapper.toDto(vehicleDocumentRepository.save(document));
    }

    @Transactional
    @Auditable(entityType = "VEHICLE_DOCUMENT", operation = AuditOperation.ELIMINACAO)
    public void deleteDocument(UUID vehicleId, UUID docId) {
        getVehicle(vehicleId);
        VehicleDocument document = vehicleDocumentRepository.findById(docId)
                .orElseThrow(() -> new ResourceNotFoundException("VEHICLE_DOCUMENT_NOT_FOUND", "Vehicle document not found"));
        document.softDelete("system");
        vehicleDocumentRepository.save(document);
    }

    @Transactional(readOnly = true)
    public List<VehicleDocumentDto> listDocuments(UUID vehicleId) {
        getVehicle(vehicleId);
        return vehicleDocumentRepository.findByVehicle_Id(vehicleId).stream().map(vehicleDocumentMapper::toDto).toList();
    }

    private Vehicle getVehicle(UUID vehicleId) {
        return vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("VEHICLE_NOT_FOUND", "Vehicle not found"));
    }

    private FileRecord getFile(UUID fileId) {
        return fileRecordRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("FILE_NOT_FOUND", "File not found"));
    }
}
