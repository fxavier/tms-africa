DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'drivers'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
          AND table_name = 'activities'
          AND constraint_name = 'fk_activities_driver'
    ) THEN
        ALTER TABLE activities
            ADD CONSTRAINT fk_activities_driver
            FOREIGN KEY (driver_id) REFERENCES drivers(id)
            ON DELETE SET NULL;
    END IF;
END $$;
