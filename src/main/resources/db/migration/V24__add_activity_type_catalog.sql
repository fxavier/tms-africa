ALTER TABLE catalog_items DROP CONSTRAINT IF EXISTS catalog_items_category_check;

ALTER TABLE catalog_items
    ADD CONSTRAINT catalog_items_category_check
    CHECK (category IN ('VEHICLE_DOCUMENT', 'DRIVER_DOCUMENT', 'ACCESSORY', 'ACTIVITY_TYPE'));

INSERT INTO catalog_items (category, code, name, system_default, sort_order) VALUES
    ('ACTIVITY_TYPE', 'CARGA_GERAL', 'Carga Geral', TRUE, 10),
    ('ACTIVITY_TYPE', 'ENTREGA_OPERACIONAL', 'Entrega Operacional', TRUE, 20),
    ('ACTIVITY_TYPE', 'RECOLHA_EQUIPAMENTO', 'Recolha de Equipamento', TRUE, 30),
    ('ACTIVITY_TYPE', 'TRANSFERENCIA_FROTA', 'Transferência de Frota', TRUE, 40)
ON CONFLICT (category, code) DO NOTHING;
