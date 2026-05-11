package pt.xavier.tms.alert.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.xavier.tms.alert.domain.Alert;
import pt.xavier.tms.alert.domain.AlertConfiguration;
import pt.xavier.tms.alert.repository.AlertConfigurationRepository;
import pt.xavier.tms.alert.repository.AlertRepository;
import pt.xavier.tms.driver.repository.DriverDocumentRepository;
import pt.xavier.tms.shared.enums.AlertSeverity;
import pt.xavier.tms.shared.enums.AlertType;
import pt.xavier.tms.shared.enums.DocumentStatus;
import pt.xavier.tms.vehicle.repository.MaintenanceRepository;
import pt.xavier.tms.vehicle.repository.VehicleDocumentRepository;

@Service
@RequiredArgsConstructor
public class AlertService {

    static final String ENTITY_VEHICLE_DOCUMENT = "VEHICLE_DOCUMENT";
    static final String ENTITY_DRIVER_DOCUMENT = "DRIVER_DOCUMENT";
    static final String ENTITY_MAINTENANCE_RECORD = "MAINTENANCE_RECORD";

    private final AlertRepository alertRepository;
    private final AlertConfigurationRepository alertConfigurationRepository;
    private final VehicleDocumentRepository vehicleDocumentRepository;
    private final DriverDocumentRepository driverDocumentRepository;
    private final MaintenanceRepository maintenanceRepository;

    @Transactional
    public void checkDocumentExpiry() {
        LocalDate today = LocalDate.now();

        AlertConfiguration vehicleCfg = getOrDefault(AlertType.DOCUMENT_EXPIRY, ENTITY_VEHICLE_DOCUMENT);
        LocalDate vehicleWarningLimit = today.plusDays(vehicleCfg.getDaysBeforeWarning());
        LocalDate vehicleCriticalLimit = today.plusDays(vehicleCfg.getDaysBeforeCritical());

        vehicleDocumentRepository.findByExpiryDateBetweenAndStatusNot(today, vehicleWarningLimit, DocumentStatus.EXPIRADO)
                .forEach(doc -> createAlertIfNotExists(
                        AlertType.DOCUMENT_EXPIRY,
                        ENTITY_VEHICLE_DOCUMENT,
                        doc.getId(),
                        doc.getExpiryDate() != null && !doc.getExpiryDate().isAfter(vehicleCriticalLimit)
                                ? AlertSeverity.CRITICO
                                : AlertSeverity.AVISO,
                        "Vehicle document expiring",
                        "Vehicle document %s expires on %s".formatted(doc.getId(), doc.getExpiryDate())
                ));

        vehicleDocumentRepository.findByExpiryDateBeforeAndStatusNot(today, DocumentStatus.EXPIRADO)
                .forEach(doc -> {
                    doc.setStatus(DocumentStatus.EXPIRADO);
                    vehicleDocumentRepository.save(doc);
                    createAlertIfNotExists(
                            AlertType.DOCUMENT_EXPIRED,
                            ENTITY_VEHICLE_DOCUMENT,
                            doc.getId(),
                            AlertSeverity.CRITICO,
                            "Vehicle document expired",
                            "Vehicle document %s is expired".formatted(doc.getId())
                    );
                });

        AlertConfiguration driverCfg = getOrDefault(AlertType.DOCUMENT_EXPIRY, ENTITY_DRIVER_DOCUMENT);
        LocalDate driverWarningLimit = today.plusDays(driverCfg.getDaysBeforeWarning());
        LocalDate driverCriticalLimit = today.plusDays(driverCfg.getDaysBeforeCritical());

        driverDocumentRepository.findByExpiryDateBetweenAndStatusNot(today, driverWarningLimit, DocumentStatus.EXPIRADO)
                .forEach(doc -> createAlertIfNotExists(
                        AlertType.DOCUMENT_EXPIRY,
                        ENTITY_DRIVER_DOCUMENT,
                        doc.getId(),
                        doc.getExpiryDate() != null && !doc.getExpiryDate().isAfter(driverCriticalLimit)
                                ? AlertSeverity.CRITICO
                                : AlertSeverity.AVISO,
                        "Driver document expiring",
                        "Driver document %s expires on %s".formatted(doc.getId(), doc.getExpiryDate())
                ));

        driverDocumentRepository.findByExpiryDateBeforeAndStatusNot(today, DocumentStatus.EXPIRADO)
                .forEach(doc -> {
                    doc.setStatus(DocumentStatus.EXPIRADO);
                    driverDocumentRepository.save(doc);
                    createAlertIfNotExists(
                            AlertType.DOCUMENT_EXPIRED,
                            ENTITY_DRIVER_DOCUMENT,
                            doc.getId(),
                            AlertSeverity.CRITICO,
                            "Driver document expired",
                            "Driver document %s is expired".formatted(doc.getId())
                    );
                });
    }

    @Transactional
    public void checkMaintenanceDue() {
        LocalDate today = LocalDate.now();
        AlertConfiguration cfg = getOrDefault(AlertType.MAINTENANCE_DUE, ENTITY_MAINTENANCE_RECORD);
        LocalDate warningLimit = today.plusDays(cfg.getDaysBeforeWarning());
        LocalDate criticalLimit = today.plusDays(cfg.getDaysBeforeCritical());

        maintenanceRepository.findByNextMaintenanceDateBetween(today, warningLimit)
                .forEach(record -> {
                    AlertSeverity severity = record.getNextMaintenanceDate() != null
                            && !record.getNextMaintenanceDate().isAfter(criticalLimit)
                            ? AlertSeverity.CRITICO
                            : AlertSeverity.AVISO;
                    createAlertIfNotExists(
                            AlertType.MAINTENANCE_DUE,
                            ENTITY_MAINTENANCE_RECORD,
                            record.getId(),
                            severity,
                            "Maintenance due",
                            "Maintenance record %s due on %s".formatted(record.getId(), record.getNextMaintenanceDate())
                    );
                });

        maintenanceRepository.findByNextMaintenanceDateBefore(today)
                .forEach(record -> createAlertIfNotExists(
                        AlertType.MAINTENANCE_OVERDUE,
                        ENTITY_MAINTENANCE_RECORD,
                        record.getId(),
                        AlertSeverity.CRITICO,
                        "Maintenance overdue",
                        "Maintenance record %s is overdue".formatted(record.getId())
                ));
    }

    @Transactional
    public void resolveObsoleteAlerts() {
        LocalDate today = LocalDate.now();
        List<Alert> alerts = alertRepository.findByAlertTypeInAndResolvedFalse(List.of(
                AlertType.DOCUMENT_EXPIRY,
                AlertType.DOCUMENT_EXPIRED,
                AlertType.MAINTENANCE_DUE,
                AlertType.MAINTENANCE_OVERDUE));

        alerts.forEach(alert -> {
            boolean shouldResolve = switch (alert.getEntityType()) {
                case ENTITY_VEHICLE_DOCUMENT -> shouldResolveVehicleDocumentAlert(alert, today);
                case ENTITY_DRIVER_DOCUMENT -> shouldResolveDriverDocumentAlert(alert, today);
                case ENTITY_MAINTENANCE_RECORD -> shouldResolveMaintenanceAlert(alert, today);
                default -> false;
            };
            if (shouldResolve) {
                alert.resolve("system");
                alertRepository.save(alert);
            }
        });
    }

    private AlertConfiguration getOrDefault(AlertType alertType, String entityType) {
        return alertConfigurationRepository.findByAlertTypeAndEntityType(alertType, entityType)
                .orElseGet(() -> AlertConfiguration.defaults(alertType, entityType));
    }

    private void createAlertIfNotExists(AlertType type,
                                        String entityType,
                                        UUID entityId,
                                        AlertSeverity severity,
                                        String title,
                                        String message) {
        alertRepository.findByAlertTypeAndEntityIdAndResolvedFalse(type, entityId)
                .ifPresentOrElse(existing -> {
                    if (severity.ordinal() > existing.getSeverity().ordinal()) {
                        existing.setSeverity(severity);
                        existing.setTitle(title);
                        existing.setMessage(message);
                        alertRepository.save(existing);
                    }
                }, () -> {
                    Alert alert = new Alert();
                    alert.setId(UUID.randomUUID());
                    alert.setAlertType(type);
                    alert.setEntityType(entityType);
                    alert.setEntityId(entityId);
                    alert.setSeverity(severity);
                    alert.setTitle(title);
                    alert.setMessage(message);
                    alert.setResolved(false);
                    alertRepository.save(alert);
                });
    }

    private boolean shouldResolveVehicleDocumentAlert(Alert alert, LocalDate today) {
        var docOpt = vehicleDocumentRepository.findById(alert.getEntityId());
        if (docOpt.isEmpty()) {
            return true;
        }
        var doc = docOpt.get();
        AlertConfiguration cfg = getOrDefault(AlertType.DOCUMENT_EXPIRY, ENTITY_VEHICLE_DOCUMENT);
        LocalDate warningLimit = today.plusDays(cfg.getDaysBeforeWarning());

        if (alert.getAlertType() == AlertType.DOCUMENT_EXPIRED) {
            return doc.getStatus() != DocumentStatus.EXPIRADO;
        }
        return doc.getStatus() == DocumentStatus.EXPIRADO
                || doc.getExpiryDate() == null
                || doc.getExpiryDate().isAfter(warningLimit)
                || doc.getExpiryDate().isBefore(today);
    }

    private boolean shouldResolveDriverDocumentAlert(Alert alert, LocalDate today) {
        var docOpt = driverDocumentRepository.findById(alert.getEntityId());
        if (docOpt.isEmpty()) {
            return true;
        }
        var doc = docOpt.get();
        AlertConfiguration cfg = getOrDefault(AlertType.DOCUMENT_EXPIRY, ENTITY_DRIVER_DOCUMENT);
        LocalDate warningLimit = today.plusDays(cfg.getDaysBeforeWarning());

        if (alert.getAlertType() == AlertType.DOCUMENT_EXPIRED) {
            return doc.getStatus() != DocumentStatus.EXPIRADO;
        }
        return doc.getStatus() == DocumentStatus.EXPIRADO
                || doc.getExpiryDate() == null
                || doc.getExpiryDate().isAfter(warningLimit)
                || doc.getExpiryDate().isBefore(today);
    }

    private boolean shouldResolveMaintenanceAlert(Alert alert, LocalDate today) {
        var recordOpt = maintenanceRepository.findById(alert.getEntityId());
        if (recordOpt.isEmpty()) {
            return true;
        }
        var record = recordOpt.get();
        if (record.getNextMaintenanceDate() == null) {
            return true;
        }

        if (alert.getAlertType() == AlertType.MAINTENANCE_OVERDUE) {
            return !record.getNextMaintenanceDate().isBefore(today);
        }

        AlertConfiguration cfg = getOrDefault(AlertType.MAINTENANCE_DUE, ENTITY_MAINTENANCE_RECORD);
        LocalDate warningLimit = today.plusDays(cfg.getDaysBeforeWarning());
        return record.getNextMaintenanceDate().isAfter(warningLimit)
                || record.getNextMaintenanceDate().isBefore(today);
    }
}
