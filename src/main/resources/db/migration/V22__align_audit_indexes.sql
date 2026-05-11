CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_operation ON audit_logs (operation);
CREATE INDEX IF NOT EXISTS idx_audit_performed_by ON audit_logs (performed_by);
CREATE INDEX IF NOT EXISTS idx_audit_performed_at ON audit_logs (occurred_at);
