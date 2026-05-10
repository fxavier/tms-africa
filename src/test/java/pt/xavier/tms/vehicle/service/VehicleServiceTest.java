package pt.xavier.tms.vehicle.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pt.xavier.tms.shared.enums.VehicleStatus;
import pt.xavier.tms.shared.exception.BusinessException;
import pt.xavier.tms.vehicle.domain.Vehicle;
import pt.xavier.tms.vehicle.dto.VehicleCreateDto;
import pt.xavier.tms.vehicle.mapper.ChecklistMapper;
import pt.xavier.tms.vehicle.mapper.MaintenanceMapper;
import pt.xavier.tms.vehicle.mapper.VehicleDocumentMapper;
import pt.xavier.tms.vehicle.mapper.VehicleMapper;
import pt.xavier.tms.vehicle.repository.ChecklistInspectionRepository;
import pt.xavier.tms.vehicle.repository.MaintenanceRepository;
import pt.xavier.tms.vehicle.repository.VehicleAccessoryRepository;
import pt.xavier.tms.vehicle.repository.VehicleDocumentRepository;
import pt.xavier.tms.vehicle.repository.VehicleRepository;

@ExtendWith(MockitoExtension.class)
class VehicleServiceTest {

    @Mock private VehicleRepository vehicleRepository;
    @Mock private VehicleDocumentRepository vehicleDocumentRepository;
    @Mock private VehicleAccessoryRepository vehicleAccessoryRepository;
    @Mock private MaintenanceRepository maintenanceRepository;
    @Mock private ChecklistInspectionRepository checklistInspectionRepository;
    @Mock private VehicleMapper vehicleMapper;
    @Mock private VehicleDocumentMapper vehicleDocumentMapper;
    @Mock private MaintenanceMapper maintenanceMapper;
    @Mock private ChecklistMapper checklistMapper;

    @InjectMocks
    private VehicleService vehicleService;

    @Test
    void createVehicleWithDuplicatePlateShouldThrowBusinessException() {
        VehicleCreateDto dto = new VehicleCreateDto("AA-00-BB", "Mercedes", "Sprinter", "FURGAO", 1000,
                "Maputo", LocalDate.now(), null);
        when(vehicleRepository.existsByPlate("AA-00-BB")).thenReturn(true);

        assertThatThrownBy(() -> vehicleService.createVehicle(dto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("plate already exists");
    }

    @Test
    void deleteVehicleShouldSetSoftDeleteFields() {
        UUID id = UUID.randomUUID();
        Vehicle vehicle = new Vehicle();
        vehicle.setId(id);
        when(vehicleRepository.findById(id)).thenReturn(Optional.of(vehicle));
        when(vehicleRepository.save(any(Vehicle.class))).thenAnswer(inv -> inv.getArgument(0));

        vehicleService.deleteVehicle(id);

        assertThat(vehicle.getDeletedAt()).isNotNull();
        assertThat(vehicle.getDeletedBy()).isEqualTo("system");
    }

    @Test
    void updateStatusToAbatidaShouldPersistNewStatus() {
        UUID id = UUID.randomUUID();
        Vehicle vehicle = new Vehicle();
        vehicle.setId(id);
        vehicle.setStatus(VehicleStatus.DISPONIVEL);
        when(vehicleRepository.findById(id)).thenReturn(Optional.of(vehicle));
        when(vehicleRepository.save(any(Vehicle.class))).thenAnswer(inv -> inv.getArgument(0));
        when(vehicleMapper.toResponseDto(any(Vehicle.class))).thenReturn(null);

        vehicleService.updateStatus(id, VehicleStatus.ABATIDA);

        assertThat(vehicle.getStatus()).isEqualTo(VehicleStatus.ABATIDA);
    }
}
