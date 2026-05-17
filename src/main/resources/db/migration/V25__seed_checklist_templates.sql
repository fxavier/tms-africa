WITH template AS (
    INSERT INTO checklist_templates (id, vehicle_type, name, is_active, created_by, updated_by)
    VALUES (gen_random_uuid(), 'GERAL', 'Inspeção Operacional Geral', TRUE, 'system', 'system')
    ON CONFLICT DO NOTHING
    RETURNING id
),
selected_template AS (
    SELECT id FROM template
    UNION ALL
    SELECT id FROM checklist_templates WHERE name = 'Inspeção Operacional Geral'
    LIMIT 1
)
INSERT INTO checklist_template_items (template_id, item_name, is_critical, display_order, created_by, updated_by)
SELECT selected_template.id, item.item_name, item.is_critical, item.display_order, 'system', 'system'
FROM selected_template
CROSS JOIN (
    VALUES
        ('Pneus', TRUE, 10),
        ('Travões', TRUE, 20),
        ('Luzes', TRUE, 30),
        ('Extintor', TRUE, 40),
        ('Triângulo de sinalização', TRUE, 50),
        ('Roda sobressalente', FALSE, 60),
        ('Macaco', FALSE, 70),
        ('Colete refletor', TRUE, 80)
) AS item(item_name, is_critical, display_order)
WHERE NOT EXISTS (
    SELECT 1
    FROM checklist_template_items existing
    WHERE existing.template_id = selected_template.id
      AND existing.item_name = item.item_name
);
