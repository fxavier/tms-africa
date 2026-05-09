CREATE TABLE maintenance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(20) NOT NULL
        CHECK (maintenance_type IN ('PREVENTIVA', 'CORRETIVA')),
    performed_at DATE NOT NULL,
    mileage_at_service INTEGER,
    description TEXT NOT NULL,
    supplier VARCHAR(200),
    total_cost NUMERIC(15, 2),
    parts_replaced TEXT,
    next_maintenance_date DATE,
    next_maintenance_mileage INTEGER,
    responsible_user VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_by VARCHAR(100) NOT NULL
);
