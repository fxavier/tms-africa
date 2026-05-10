CREATE TABLE IF NOT EXISTS activity_events (
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

CREATE INDEX IF NOT EXISTS idx_activity_events_activity ON activity_events (activity_id);
