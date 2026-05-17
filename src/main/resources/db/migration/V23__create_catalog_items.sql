ALTER TABLE vehicle_documents DROP CONSTRAINT IF EXISTS vehicle_documents_document_type_check;
ALTER TABLE vehicle_documents ALTER COLUMN document_type TYPE VARCHAR(80);

ALTER TABLE driver_documents DROP CONSTRAINT IF EXISTS driver_documents_document_type_check;
ALTER TABLE driver_documents ALTER COLUMN document_type TYPE VARCHAR(80);

ALTER TABLE vehicle_accessories DROP CONSTRAINT IF EXISTS vehicle_accessories_accessory_type_check;
ALTER TABLE vehicle_accessories ALTER COLUMN accessory_type TYPE VARCHAR(80);

CREATE TABLE IF NOT EXISTS catalog_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(40) NOT NULL CHECK (category IN ('VEHICLE_DOCUMENT', 'DRIVER_DOCUMENT', 'ACCESSORY')),
    code VARCHAR(80) NOT NULL,
    name VARCHAR(120) NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    system_default BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (category, code)
);

INSERT INTO catalog_items (category, code, name, system_default, sort_order) VALUES
    ('VEHICLE_DOCUMENT', 'LIVRETE', 'Livrete', TRUE, 10),
    ('VEHICLE_DOCUMENT', 'INSPECAO_PERIODICA', 'Inspeção periódica', TRUE, 20),
    ('VEHICLE_DOCUMENT', 'SEGURO', 'Seguro', TRUE, 30),
    ('VEHICLE_DOCUMENT', 'LICENCA_CIRCULACAO', 'Licença de circulação', TRUE, 40),
    ('VEHICLE_DOCUMENT', 'MANIFESTO_CARGA', 'Manifesto de carga', TRUE, 50),
    ('VEHICLE_DOCUMENT', 'TAXA_RADIO', 'Taxa rádio', TRUE, 60),
    ('DRIVER_DOCUMENT', 'CARTA_CONDUCAO', 'Carta de condução', TRUE, 10),
    ('DRIVER_DOCUMENT', 'BILHETE_IDENTIDADE', 'Bilhete de identidade', TRUE, 20),
    ('DRIVER_DOCUMENT', 'OUTRO', 'Outro', TRUE, 30),
    ('ACCESSORY', 'MACACO', 'Macaco', TRUE, 10),
    ('ACCESSORY', 'RODA_SOBRESSALENTE', 'Roda sobressalente', TRUE, 20),
    ('ACCESSORY', 'TRIANGULO', 'Triângulo', TRUE, 30),
    ('ACCESSORY', 'EXTINTOR', 'Extintor', TRUE, 40),
    ('ACCESSORY', 'KIT_PRIMEIROS_SOCORROS', 'Kit de primeiros socorros', TRUE, 50),
    ('ACCESSORY', 'COLETE_REFLETOR', 'Colete refletor', TRUE, 60)
ON CONFLICT (category, code) DO NOTHING;
