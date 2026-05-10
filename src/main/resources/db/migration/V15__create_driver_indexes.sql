CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers (status);
CREATE INDEX IF NOT EXISTS idx_drivers_license_expiry ON drivers (license_expiry_date);
CREATE INDEX IF NOT EXISTS idx_drivers_location ON drivers (activity_location);
CREATE INDEX IF NOT EXISTS idx_drivers_employee ON drivers (employee_id);
CREATE INDEX IF NOT EXISTS idx_driver_docs_driver ON driver_documents (driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_docs_expiry ON driver_documents (expiry_date);
