CREATE TABLE driver_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    document_type VARCHAR(30) NOT NULL
        CHECK (document_type IN ('CARTA_CONDUCAO', 'BILHETE_IDENTIDADE', 'OUTRO')),
    document_number VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    issuing_entity VARCHAR(200),
    category VARCHAR(20),
    status VARCHAR(30) NOT NULL DEFAULT 'VALIDO'
        CHECK (status IN ('VALIDO', 'EXPIRADO', 'PENDENTE_RENOVACAO', 'CANCELADO')),
    notes TEXT,
    file_id UUID REFERENCES files(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_by VARCHAR(100) NOT NULL,
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(100)
);
