package pt.xavier.tms.vehicle.service;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
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
import pt.xavier.tms.vehicle.dto.VehicleCreateDto;
import pt.xavier.tms.vehicle.dto.VehicleResponseDto;
import pt.xavier.tms.vehicle.dto.VehicleUpdateDto;
import pt.xavier.tms.vehicle.repository.VehicleRepository;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    @Transactional
    @Auditable(entityType = "VEHICLE", operation = AuditOperation.CRIACAO)
    public VehicleResponseDto createVehicle(VehicleCreateDto dto) {
        if (vehicleRepository.existsByPlate(dto.plate())) {
            throw new BusinessException("PLATE_ALREADY_EXISTS", "Vehicle plate already exists");
        }

        Vehicle vehicle = new Vehicle();
        vehicle.setId(UUID.randomUUID());
        vehicle.setPlate(dto.plate());
        vehicle.setBrand(dto.brand());
        vehicle.setModel(dto.model());
        vehicle.setVehicleType(dto.vehicleType());
        vehicle.setCapacity(dto.capacity());
        vehicle.setActivityLocation(dto.activityLocation());
        vehicle.setActivityStartDate(dto.activityStartDate());
        vehicle.setNotes(dto.notes());
        vehicle.setStatus(VehicleStatus.DISPONIVEL);

        return toResponse(vehicleRepository.save(vehicle));
    }

    @Transactional
    @Auditable(entityType = "VEHICLE", operation = AuditOperation.ATUALIZACAO)
    public VehicleResponseDto updateVehicle(UUID vehicleId, VehicleUpdateDto dto) {
        Vehicle vehicle = findVehicle(vehicleId);
        vehicle.setBrand(dto.brand());
        vehicle.setModel(dto.model());
        vehicle.setVehicleType(dto.vehicleType());
        vehicle.setCapacity(dto.capacity());
        vehicle.setActivityLocation(dto.activityLocation());
        vehicle.setActivityStartDate(dto.activityStartDate());
        vehicle.setNotes(dto.notes());
        return toResponse(vehicleRepository.save(vehicle));
    }

    @Transactional
    @Auditable(entityType = "VEHICLE", operation = AuditOperation.ATUALIZACAO)
    public VehicleResponseDto updateStatus(UUID vehicleId, VehicleStatus status) {
        Vehicle vehicle = findVehicle(vehicleId);
        vehicle.setStatus(status);
        return toResponse(vehicleRepository.save(vehicle));
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
        return toResponse(findVehicle(vehicleId));
    }

    @Transactional(readOnly = true)
    public Page<VehicleResponseDto> listVehicles(VehicleStatus status, String location, Pageable pageable) {
        return vehicleRepository.findAllByFilters(status, location, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<VehicleResponseDto> searchByPlate(String q, Pageable pageable) {
        return vehicleRepository.findByPlateContainingIgnoreCase(q, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public VehicleResponseDto getConsolidated(UUID vehicleId) {
        return toResponse(findVehicle(vehicleId));
    }

    private Vehicle findVehicle(UUID vehicleId) {
        return vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("VEHICLE_NOT_FOUND", "Vehicle not found"));
    }

    private VehicleResponseDto toResponse(Vehicle vehicle) {
        return new VehicleResponseDto(
                vehicle.getId(),
                vehicle.getPlate(),
                vehicle.getBrand(),
                vehicle.getModel(),
                vehicle.getVehicleType(),
                vehicle.getCapacity(),
                vehicle.getActivityLocation(),
                vehicle.getActivityStartDate(),
                vehicle.getStatus(),
                vehicle.getCurrentDriverId(),
                vehicle.getNotes(),
                vehicle.getCreatedAt()
        );
    }
}
