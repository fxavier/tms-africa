CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) NOT NULL UNIQUE,
    title VARCHAR(300) NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    location VARCHAR(300) NOT NULL,
    planned_start TIMESTAMPTZ NOT NULL,
    planned_end TIMESTAMPTZ NOT NULL,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIA'
        CHECK (priority IN ('BAIXA', 'MEDIA', 'ALTA', 'CRITICA')),
    status VARCHAR(20) NOT NULL DEFAULT 'PLANEADA'
        CHECK (status IN ('PLANEADA', 'EM_CURSO', 'SUSPENSA', 'CONCLUIDA', 'CANCELADA')),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    driver_id UUID,
    description TEXT,
    notes TEXT,
    rh_override_justification TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_by VARCHAR(100) NOT NULL,
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(100)
);
