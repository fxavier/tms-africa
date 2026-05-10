package pt.xavier.tms.vehicle.service;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.xavier.tms.audit.annotation.Auditable;
import pt.xavier.tms.shared.enums.AuditOperation;
import pt.xavier.tms.shared.exception.ResourceNotFoundException;
import pt.xavier.tms.vehicle.domain.MaintenanceRecord;
import pt.xavier.tms.vehicle.domain.Vehicle;
import pt.xavier.tms.vehicle.dto.MaintenanceRecordDto;
import pt.xavier.tms.vehicle.event.MaintenanceRegisteredEvent;
import pt.xavier.tms.vehicle.repository.MaintenanceRepository;
import pt.xavier.tms.vehicle.repository.VehicleRepository;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final VehicleRepository vehicleRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    @Auditable(entityType = "MAINTENANCE", operation = AuditOperation.CRIACAO)
    public MaintenanceRecordDto registerMaintenance(UUID vehicleId, MaintenanceRecordDto dto) {
        Vehicle vehicle = getVehicle(vehicleId);
        MaintenanceRecord record = new MaintenanceRecord();
        record.setId(UUID.randomUUID());
        record.setVehicle(vehicle);
        record.setMaintenanceType(dto.maintenanceType());
        record.setPerformedAt(dto.performedAt());
        record.setMileageAtService(dto.mileageAtService());
        record.setDescription(dto.description());
        record.setSupplier(dto.supplier());
        record.setTotalCost(dto.totalCost());
        record.setPartsReplaced(dto.partsReplaced());
        record.setNextMaintenanceDate(dto.nextMaintenanceDate());
        record.setNextMaintenanceMileage(dto.nextMaintenanceMileage());
        record.setResponsibleUser(dto.responsibleUser());

        MaintenanceRecord saved = maintenanceRepository.save(record);
        if (saved.getNextMaintenanceDate() != null) {
            eventPublisher.publishEvent(new MaintenanceRegisteredEvent(saved.getVehicle().getId(), saved.getId(), saved.getNextMaintenanceDate()));
        }
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public Page<MaintenanceRecordDto> listMaintenance(UUID vehicleId, Pageable pageable) {
        getVehicle(vehicleId);
        return maintenanceRepository.findByVehicle_Id(vehicleId, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public MaintenanceRecordDto getMaintenance(UUID vehicleId, UUID maintenanceId) {
        getVehicle(vehicleId);
        MaintenanceRecord record = maintenanceRepository.findById(maintenanceId)
                .orElseThrow(() -> new ResourceNotFoundException("MAINTENANCE_NOT_FOUND", "Maintenance record not found"));
        return toDto(record);
    }

    private Vehicle getVehicle(UUID vehicleId) {
        return vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("VEHICLE_NOT_FOUND", "Vehicle not found"));
    }

    private MaintenanceRecordDto toDto(MaintenanceRecord record) {
        return new MaintenanceRecordDto(
                record.getId(),
                record.getMaintenanceType(),
                record.getPerformedAt(),
                record.getMileageAtService(),
                record.getDescription(),
                record.getSupplier(),
                record.getTotalCost(),
                record.getPartsReplaced(),
                record.getNextMaintenanceDate(),
                record.getNextMaintenanceMileage(),
                record.getResponsibleUser()
        );
    }
}
