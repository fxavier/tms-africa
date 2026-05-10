CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    id_number VARCHAR(50) NOT NULL UNIQUE,
    license_number VARCHAR(50) NOT NULL UNIQUE,
    license_category VARCHAR(20) NOT NULL,
    license_issue_date DATE NOT NULL,
    license_expiry_date DATE NOT NULL,
    activity_location VARCHAR(200) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ATIVO'
        CHECK (status IN ('ATIVO', 'INATIVO', 'SUSPENSO')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_by VARCHAR(100) NOT NULL,
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(100),
    employee_id UUID,
    CONSTRAINT fk_drivers_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
);
