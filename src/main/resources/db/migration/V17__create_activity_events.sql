CREATE TABLE activity_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    previous_status VARCHAR(20),
    new_status VARCHAR(20),
    performed_by VARCHAR(100) NOT NULL,
    performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL
);

CREATE INDEX idx_activities_status ON activities (status);
CREATE INDEX idx_activities_vehicle ON activities (vehicle_id);
CREATE INDEX idx_activities_driver ON activities (driver_id);
CREATE INDEX idx_activities_planned_start ON activities (planned_start);
CREATE INDEX idx_activities_code ON activities (code);
CREATE INDEX idx_activity_events_activity ON activity_events (activity_id);
