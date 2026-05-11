CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type VARCHAR(40) NOT NULL
        CHECK (alert_type IN ('DOCUMENT_EXPIRY', 'MAINTENANCE_DUE', 'ALLOCATION_CONFLICT')),
    severity VARCHAR(20) NOT NULL
        CHECK (severity IN ('INFO', 'AVISO', 'CRITICO')),
    entity_type VARCHAR(80) NOT NULL,
    entity_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolved_by VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_by VARCHAR(100) NOT NULL,
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(100)
);

CREATE UNIQUE INDEX idx_alerts_dedup
    ON alerts(alert_type, entity_id)
    WHERE is_resolved = FALSE;

CREATE INDEX idx_alerts_entity ON alerts(entity_type, entity_id);
CREATE INDEX idx_alerts_is_resolved ON alerts(is_resolved);
CREATE INDEX idx_alerts_severity ON alerts(severity);

CREATE TABLE alert_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type VARCHAR(40) NOT NULL
        CHECK (alert_type IN ('DOCUMENT_EXPIRY', 'MAINTENANCE_DUE', 'ALLOCATION_CONFLICT')),
    entity_type VARCHAR(80) NOT NULL,
    days_before_warning INTEGER NOT NULL DEFAULT 30,
    days_before_critical INTEGER NOT NULL DEFAULT 7,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_by VARCHAR(100) NOT NULL,
    UNIQUE (alert_type, entity_type)
);

INSERT INTO alert_configurations (
    alert_type,
    entity_type,
    days_before_warning,
    days_before_critical,
    is_active,
    created_by,
    updated_by
)
VALUES
    ('DOCUMENT_EXPIRY', 'VEHICLE_DOCUMENT', 30, 7, TRUE, 'system', 'system'),
    ('DOCUMENT_EXPIRY', 'DRIVER_DOCUMENT', 30, 7, TRUE, 'system', 'system'),
    ('MAINTENANCE_DUE', 'MAINTENANCE_RECORD', 30, 7, TRUE, 'system', 'system')
ON CONFLICT (alert_type, entity_type) DO NOTHING;
