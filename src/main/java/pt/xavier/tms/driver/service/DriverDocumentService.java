package pt.xavier.tms.driver.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.xavier.tms.audit.annotation.Auditable;
import pt.xavier.tms.driver.domain.Driver;
import pt.xavier.tms.driver.domain.DriverDocument;
import pt.xavier.tms.driver.dto.DriverDocumentDto;
import pt.xavier.tms.driver.repository.DriverDocumentRepository;
import pt.xavier.tms.shared.enums.AuditOperation;
import pt.xavier.tms.shared.enums.DocumentStatus;
import pt.xavier.tms.shared.enums.DriverDocumentType;
import pt.xavier.tms.shared.exception.ResourceNotFoundException;
import pt.xavier.tms.vehicle.repository.FileRecordRepository;

@Service
@RequiredArgsConstructor
public class DriverDocumentService {

    private final DriverService driverService;
    private final DriverDocumentRepository repository;
    private final FileRecordRepository fileRecordRepository;

    @Transactional
    @Auditable(entityType = "DRIVER_DOCUMENT", operation = AuditOperation.CRIACAO)
    public DriverDocumentDto addDocument(UUID driverId, DriverDocumentDto dto) {
        Driver driver = driverService.getEntity(driverId);
        DriverDocument document = new DriverDocument();
        document.setId(UUID.randomUUID());
        document.setDriver(driver);
        apply(document, dto);
        return toDto(repository.save(document));
    }

    @Transactional
    @Auditable(entityType = "DRIVER_DOCUMENT", operation = AuditOperation.ATUALIZACAO)
    public DriverDocumentDto updateDocument(UUID driverId, UUID docId, DriverDocumentDto dto) {
        driverService.getEntity(driverId);
        DriverDocument document = repository.findById(docId)
                .orElseThrow(() -> new ResourceNotFoundException("DRIVER_DOCUMENT_NOT_FOUND", "Driver document not found"));
        apply(document, dto);
        return toDto(repository.save(document));
    }

    @Transactional(readOnly = true)
    public List<DriverDocumentDto> listDocuments(UUID driverId) {
        driverService.getEntity(driverId);
        List<DriverDocument> documents = repository.findByDriver_Id(driverId);
        LocalDate today = LocalDate.now();
        documents.forEach(doc -> {
            if (doc.getDocumentType() == DriverDocumentType.CARTA_CONDUCAO
                    && doc.getExpiryDate() != null
                    && doc.getExpiryDate().isBefore(today)
                    && doc.getStatus() != DocumentStatus.EXPIRADO) {
                doc.setStatus(DocumentStatus.EXPIRADO);
                repository.save(doc);
            }
        });
        return documents.stream().map(this::toDto).toList();
    }

    private void apply(DriverDocument document, DriverDocumentDto dto) {
        document.setDocumentType(dto.documentType());
        document.setDocumentNumber(dto.documentNumber());
        document.setIssueDate(dto.issueDate());
        document.setExpiryDate(dto.expiryDate());
        document.setIssuingEntity(dto.issuingEntity());
        document.setCategory(dto.category());
        document.setStatus(dto.status());
        document.setNotes(dto.notes());
        if (dto.fileId() != null) {
            document.setFile(fileRecordRepository.findById(dto.fileId())
                    .orElseThrow(() -> new ResourceNotFoundException("FILE_NOT_FOUND", "File not found")));
        } else {
            document.setFile(null);
        }
    }

    private DriverDocumentDto toDto(DriverDocument document) {
        return new DriverDocumentDto(
                document.getId(),
                document.getDocumentType(),
                document.getDocumentNumber(),
                document.getIssueDate(),
                document.getExpiryDate(),
                document.getIssuingEntity(),
                document.getCategory(),
                document.getStatus(),
                document.getNotes(),
                document.getFile() == null ? null : document.getFile().getId()
        );
    }
}
