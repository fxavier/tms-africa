CREATE TABLE vehicle_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    document_type VARCHAR(40) NOT NULL
        CHECK (document_type IN ('LIVRETE', 'INSPECAO_PERIODICA', 'SEGURO', 'LICENCA_CIRCULACAO', 'MANIFESTO_CARGA', 'TAXA_RADIO')),
    document_number VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    issuing_entity VARCHAR(200),
    status VARCHAR(30) NOT NULL DEFAULT 'VALIDO'
        CHECK (status IN ('VALIDO', 'EXPIRADO', 'PENDENTE_RENOVACAO', 'CANCELADO')),
    notes TEXT,
    file_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_by VARCHAR(100) NOT NULL,
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(100)
);
