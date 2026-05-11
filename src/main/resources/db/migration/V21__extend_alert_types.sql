ALTER TABLE alerts DROP CONSTRAINT IF EXISTS alerts_alert_type_check;
ALTER TABLE alert_configurations DROP CONSTRAINT IF EXISTS alert_configurations_alert_type_check;

ALTER TABLE alerts
    ADD CONSTRAINT alerts_alert_type_check
    CHECK (alert_type IN (
        'DOCUMENT_EXPIRY',
        'DOCUMENT_EXPIRED',
        'MAINTENANCE_DUE',
        'MAINTENANCE_OVERDUE',
        'ALLOCATION_CONFLICT'
    ));

ALTER TABLE alert_configurations
    ADD CONSTRAINT alert_configurations_alert_type_check
    CHECK (alert_type IN (
        'DOCUMENT_EXPIRY',
        'DOCUMENT_EXPIRED',
        'MAINTENANCE_DUE',
        'MAINTENANCE_OVERDUE',
        'ALLOCATION_CONFLICT'
    ));
