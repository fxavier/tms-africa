package pt.xavier.tms.alert.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pt.xavier.tms.alert.domain.Alert;
import pt.xavier.tms.alert.domain.AlertConfiguration;
import pt.xavier.tms.alert.repository.AlertConfigurationRepository;
import pt.xavier.tms.alert.repository.AlertRepository;
import pt.xavier.tms.shared.enums.AlertSeverity;
import pt.xavier.tms.shared.enums.AlertType;
import pt.xavier.tms.shared.enums.DocumentStatus;
import pt.xavier.tms.vehicle.domain.MaintenanceRecord;
import pt.xavier.tms.vehicle.domain.VehicleDocument;

@ExtendWith(MockitoExtension.class)
class AlertServiceTest {

    @Mock private AlertRepository alertRepository;
    @Mock private AlertConfigurationRepository alertConfigurationRepository;
    @Mock private pt.xavier.tms.vehicle.repository.VehicleDocumentRepository vehicleDocumentRepository;
    @Mock private pt.xavier.tms.driver.repository.DriverDocumentRepository driverDocumentRepository;
    @Mock private pt.xavier.tms.vehicle.repository.MaintenanceRepository maintenanceRepository;

    @InjectMocks private AlertService alertService;

    @Test
    void checkDocumentExpiryCreatesWarningFor20Days() {
        VehicleDocument doc = new VehicleDocument();
        doc.setId(UUID.randomUUID());
        doc.setExpiryDate(LocalDate.now().plusDays(20));
        doc.setStatus(DocumentStatus.VALIDO);
        when(vehicleDocumentRepository.findByExpiryDateBetweenAndStatusNot(any(), any(), any())).thenReturn(List.of(doc));
        when(vehicleDocumentRepository.findByExpiryDateBeforeAndStatusNot(any(), any())).thenReturn(List.of());
        when(driverDocumentRepository.findByExpiryDateBetweenAndStatusNot(any(), any(), any())).thenReturn(List.of());
        when(driverDocumentRepository.findByExpiryDateBeforeAndStatusNot(any(), any())).thenReturn(List.of());
        when(alertRepository.findByAlertTypeAndEntityIdAndResolvedFalse(AlertType.DOCUMENT_EXPIRY, doc.getId()))
                .thenReturn(Optional.empty());

        alertService.checkDocumentExpiry();

        ArgumentCaptor<Alert> captor = ArgumentCaptor.forClass(Alert.class);
        verify(alertRepository).save(captor.capture());
        assertThat(captor.getValue().getSeverity()).isEqualTo(AlertSeverity.AVISO);
    }

    @Test
    void checkDocumentExpiryCreatesCriticalFor5Days() {
        VehicleDocument doc = new VehicleDocument();
        doc.setId(UUID.randomUUID());
        doc.setExpiryDate(LocalDate.now().plusDays(5));
        doc.setStatus(DocumentStatus.VALIDO);
        when(vehicleDocumentRepository.findByExpiryDateBetweenAndStatusNot(any(), any(), any())).thenReturn(List.of(doc));
        when(vehicleDocumentRepository.findByExpiryDateBeforeAndStatusNot(any(), any())).thenReturn(List.of());
        when(driverDocumentRepository.findByExpiryDateBetweenAndStatusNot(any(), any(), any())).thenReturn(List.of());
        when(driverDocumentRepository.findByExpiryDateBeforeAndStatusNot(any(), any())).thenReturn(List.of());
        when(alertRepository.findByAlertTypeAndEntityIdAndResolvedFalse(AlertType.DOCUMENT_EXPIRY, doc.getId()))
                .thenReturn(Optional.empty());

        alertService.checkDocumentExpiry();

        ArgumentCaptor<Alert> captor = ArgumentCaptor.forClass(Alert.class);
        verify(alertRepository).save(captor.capture());
        assertThat(captor.getValue().getSeverity()).isEqualTo(AlertSeverity.CRITICO);
    }

    @Test
    void checkDocumentExpiryMarksExpiredDocumentStatus() {
        VehicleDocument expired = new VehicleDocument();
        expired.setId(UUID.randomUUID());
        expired.setExpiryDate(LocalDate.now().minusDays(1));
        expired.setStatus(DocumentStatus.VALIDO);
        when(vehicleDocumentRepository.findByExpiryDateBetweenAndStatusNot(any(), any(), any())).thenReturn(List.of());
        when(vehicleDocumentRepository.findByExpiryDateBeforeAndStatusNot(any(), any())).thenReturn(List.of(expired));
        when(driverDocumentRepository.findByExpiryDateBetweenAndStatusNot(any(), any(), any())).thenReturn(List.of());
        when(driverDocumentRepository.findByExpiryDateBeforeAndStatusNot(any(), any())).thenReturn(List.of());
        when(alertRepository.findByAlertTypeAndEntityIdAndResolvedFalse(AlertType.DOCUMENT_EXPIRED, expired.getId()))
                .thenReturn(Optional.empty());

        alertService.checkDocumentExpiry();

        assertThat(expired.getStatus()).isEqualTo(DocumentStatus.EXPIRADO);
        verify(vehicleDocumentRepository).save(expired);
    }

    @Test
    void createAlertShouldNotDuplicateWhenExistingUnresolved() {
        VehicleDocument doc = new VehicleDocument();
        doc.setId(UUID.randomUUID());
        doc.setExpiryDate(LocalDate.now().plusDays(20));
        doc.setStatus(DocumentStatus.VALIDO);
        Alert existing = new Alert();
        existing.setId(UUID.randomUUID());
        existing.setSeverity(AlertSeverity.AVISO);
        when(vehicleDocumentRepository.findByExpiryDateBetweenAndStatusNot(any(), any(), any())).thenReturn(List.of(doc));
        when(vehicleDocumentRepository.findByExpiryDateBeforeAndStatusNot(any(), any())).thenReturn(List.of());
        when(driverDocumentRepository.findByExpiryDateBetweenAndStatusNot(any(), any(), any())).thenReturn(List.of());
        when(driverDocumentRepository.findByExpiryDateBeforeAndStatusNot(any(), any())).thenReturn(List.of());
        when(alertRepository.findByAlertTypeAndEntityIdAndResolvedFalse(AlertType.DOCUMENT_EXPIRY, doc.getId()))
                .thenReturn(Optional.of(existing));

        alertService.checkDocumentExpiry();

        verify(alertRepository, never()).save(any(Alert.class));
    }

    @Test
    void createAlertShouldEscalateSeverityWhenExistingLower() {
        VehicleDocument doc = new VehicleDocument();
        doc.setId(UUID.randomUUID());
        doc.setExpiryDate(LocalDate.now().plusDays(3));
        doc.setStatus(DocumentStatus.VALIDO);
        Alert existing = new Alert();
        existing.setId(UUID.randomUUID());
        existing.setSeverity(AlertSeverity.AVISO);
        when(vehicleDocumentRepository.findByExpiryDateBetweenAndStatusNot(any(), any(), any())).thenReturn(List.of(doc));
        when(vehicleDocumentRepository.findByExpiryDateBeforeAndStatusNot(any(), any())).thenReturn(List.of());
        when(driverDocumentRepository.findByExpiryDateBetweenAndStatusNot(any(), any(), any())).thenReturn(List.of());
        when(driverDocumentRepository.findByExpiryDateBeforeAndStatusNot(any(), any())).thenReturn(List.of());
        when(alertRepository.findByAlertTypeAndEntityIdAndResolvedFalse(AlertType.DOCUMENT_EXPIRY, doc.getId()))
                .thenReturn(Optional.of(existing));

        alertService.checkDocumentExpiry();

        assertThat(existing.getSeverity()).isEqualTo(AlertSeverity.CRITICO);
        verify(alertRepository).save(existing);
    }

    @Test
    void checkMaintenanceDueCreatesOverdueAlert() {
        MaintenanceRecord record = new MaintenanceRecord();
        record.setId(UUID.randomUUID());
        record.setNextMaintenanceDate(LocalDate.now().minusDays(2));
        when(maintenanceRepository.findByNextMaintenanceDateBetween(any(), any())).thenReturn(List.of());
        when(maintenanceRepository.findByNextMaintenanceDateBefore(any())).thenReturn(List.of(record));
        when(alertRepository.findByAlertTypeAndEntityIdAndResolvedFalse(AlertType.MAINTENANCE_OVERDUE, record.getId()))
                .thenReturn(Optional.empty());

        alertService.checkMaintenanceDue();

        ArgumentCaptor<Alert> captor = ArgumentCaptor.forClass(Alert.class);
        verify(alertRepository).save(captor.capture());
        assertThat(captor.getValue().getAlertType()).isEqualTo(AlertType.MAINTENANCE_OVERDUE);
        assertThat(captor.getValue().getSeverity()).isEqualTo(AlertSeverity.CRITICO);
    }

    @Test
    void resolveObsoleteAlertsShouldResolveWhenDocumentRenewed() {
        Alert alert = new Alert();
        alert.setId(UUID.randomUUID());
        alert.setAlertType(AlertType.DOCUMENT_EXPIRED);
        alert.setEntityType("VEHICLE_DOCUMENT");
        UUID docId = UUID.randomUUID();
        alert.setEntityId(docId);
        alert.setResolved(false);

        VehicleDocument doc = new VehicleDocument();
        doc.setId(docId);
        doc.setStatus(DocumentStatus.VALIDO);

        when(alertRepository.findByAlertTypeInAndResolvedFalse(any())).thenReturn(List.of(alert));
        when(vehicleDocumentRepository.findById(docId)).thenReturn(Optional.of(doc));

        alertService.resolveObsoleteAlerts();

        assertThat(alert.isResolved()).isTrue();
        verify(alertRepository).save(alert);
    }
}
