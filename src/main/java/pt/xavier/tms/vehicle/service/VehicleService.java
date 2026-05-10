package pt.xavier.tms.vehicle.service;

import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.xavier.tms.audit.annotation.Auditable;
import pt.xavier.tms.shared.enums.AuditOperation;
import pt.xavier.tms.shared.enums.VehicleStatus;
import pt.xavier.tms.shared.exception.BusinessException;
import pt.xavier.tms.shared.exception.ResourceNotFoundException;
import pt.xavier.tms.vehicle.domain.Vehicle;
import pt.xavier.tms.vehicle.dto.VehicleAccessoryDto;
import pt.xavier.tms.vehicle.dto.VehicleConsolidatedDto;
import pt.xavier.tms.vehicle.dto.VehicleCreateDto;
import pt.xavier.tms.vehicle.dto.VehicleResponseDto;
import pt.xavier.tms.vehicle.dto.VehicleUpdateDto;
import pt.xavier.tms.vehicle.mapper.ChecklistMapper;
import pt.xavier.tms.vehicle.mapper.MaintenanceMapper;
import pt.xavier.tms.vehicle.mapper.VehicleDocumentMapper;
import pt.xavier.tms.vehicle.mapper.VehicleMapper;
import pt.xavier.tms.vehicle.repository.ChecklistInspectionRepository;
import pt.xavier.tms.vehicle.repository.MaintenanceRepository;
import pt.xavier.tms.vehicle.repository.VehicleAccessoryRepository;
import pt.xavier.tms.vehicle.repository.VehicleDocumentRepository;
import pt.xavier.tms.vehicle.repository.VehicleRepository;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final VehicleDocumentRepository vehicleDocumentRepository;
    private final VehicleAccessoryRepository vehicleAccessoryRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final ChecklistInspectionRepository checklistInspectionRepository;
    private final VehicleMapper vehicleMapper;
    private final VehicleDocumentMapper vehicleDocumentMapper;
    private final MaintenanceMapper maintenanceMapper;
    private final ChecklistMapper checklistMapper;

    public VehicleService(
            VehicleRepository vehicleRepository,
            VehicleDocumentRepository vehicleDocumentRepository,
            VehicleAccessoryRepository vehicleAccessoryRepository,
            MaintenanceRepository maintenanceRepository,
            ChecklistInspectionRepository checklistInspectionRepository,
            VehicleMapper vehicleMapper,
            VehicleDocumentMapper vehicleDocumentMapper,
            MaintenanceMapper maintenanceMapper,
            ChecklistMapper checklistMapper) {
        this.vehicleRepository = vehicleRepository;
        this.vehicleDocumentRepository = vehicleDocumentRepository;
        this.vehicleAccessoryRepository = vehicleAccessoryRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.checklistInspectionRepository = checklistInspectionRepository;
        this.vehicleMapper = vehicleMapper;
        this.vehicleDocumentMapper = vehicleDocumentMapper;
        this.maintenanceMapper = maintenanceMapper;
        this.checklistMapper = checklistMapper;
    }

    @Transactional
    @Auditable(entityType = "VEHICLE", operation = AuditOperation.CRIACAO)
    public VehicleResponseDto createVehicle(VehicleCreateDto dto) {
        if (vehicleRepository.existsByPlate(dto.plate())) {
            throw new BusinessException("PLATE_ALREADY_EXISTS", "Vehicle plate already exists");
        }

        Vehicle vehicle = vehicleMapper.toEntity(dto);
        vehicle.setId(UUID.randomUUID());
        vehicle.setStatus(VehicleStatus.DISPONIVEL);

        return vehicleMapper.toResponseDto(vehicleRepository.save(vehicle));
    }

    @Transactional
    @Auditable(entityType = "VEHICLE", operation = AuditOperation.ATUALIZACAO)
    public VehicleResponseDto updateVehicle(UUID vehicleId, VehicleUpdateDto dto) {
        Vehicle vehicle = findVehicle(vehicleId);
        vehicleMapper.updateEntity(dto, vehicle);
        return vehicleMapper.toResponseDto(vehicleRepository.save(vehicle));
    }

    @Transactional
    @Auditable(entityType = "VEHICLE", operation = AuditOperation.ATUALIZACAO)
    public VehicleResponseDto updateStatus(UUID vehicleId, VehicleStatus status) {
        Vehicle vehicle = findVehicle(vehicleId);
        vehicle.setStatus(status);
        return vehicleMapper.toResponseDto(vehicleRepository.save(vehicle));
    }

    @Transactional
    @Auditable(entityType = "VEHICLE", operation = AuditOperation.ELIMINACAO)
    public void deleteVehicle(UUID vehicleId) {
        Vehicle vehicle = findVehicle(vehicleId);
        vehicle.softDelete("system");
        vehicleRepository.save(vehicle);
    }

    @Transactional(readOnly = true)
    public VehicleResponseDto getVehicle(UUID vehicleId) {
        return vehicleMapper.toResponseDto(findVehicle(vehicleId));
    }

    @Transactional(readOnly = true)
    public Page<VehicleResponseDto> listVehicles(VehicleStatus status, String location, Pageable pageable) {
        return vehicleRepository.findAllByFilters(status, location, pageable).map(vehicleMapper::toResponseDto);
    }

    @Transactional(readOnly = true)
    public Page<VehicleResponseDto> searchByPlate(String q, Pageable pageable) {
        return vehicleRepository.findByPlateContainingIgnoreCase(q, pageable).map(vehicleMapper::toResponseDto);
    }

    @Transactional(readOnly = true)
    public VehicleConsolidatedDto getConsolidated(UUID vehicleId) {
        Vehicle vehicle = findVehicle(vehicleId);
        List<VehicleAccessoryDto> accessories = checklistMapper.toAccessoryDtos(
                vehicleAccessoryRepository.findByVehicle_Id(vehicleId));

        return new VehicleConsolidatedDto(
                vehicleMapper.toResponseDto(vehicle),
                vehicleDocumentRepository.findByVehicle_Id(vehicleId).stream().map(vehicleDocumentMapper::toDto).toList(),
                accessories,
                maintenanceRepository.findByVehicle_Id(vehicleId, Pageable.unpaged()).stream().map(maintenanceMapper::toDto).toList(),
                checklistInspectionRepository.findByVehicle_Id(vehicleId).stream()
                        .map(checklistMapper::toInspectionDto)
                        .toList(),
                List.of(),
                List.of()
        );
    }

    private Vehicle findVehicle(UUID vehicleId) {
        return vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("VEHICLE_NOT_FOUND", "Vehicle not found"));
    }

}
