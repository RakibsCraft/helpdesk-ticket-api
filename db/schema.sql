-- Tickets table for the helpdesk API.
-- Load it with:  psql "$DATABASE_URL" -f db/schema.sql

CREATE TABLE IF NOT EXISTS tickets (
    id           SERIAL PRIMARY KEY,
    title        VARCHAR(100)  NOT NULL,
    description  VARCHAR(2000) NOT NULL,
    requester    VARCHAR(254)  NOT NULL,
    priority     VARCHAR(10)   NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status       VARCHAR(20)   NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    assignee     VARCHAR(100),
    created_at   TIMESTAMPTZ   NOT NULL,
    updated_at   TIMESTAMPTZ   NOT NULL,
    resolved_at  TIMESTAMPTZ,
    sla_due_at   TIMESTAMPTZ   NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets (status);
CREATE INDEX IF NOT EXISTS idx_tickets_assignee ON tickets (assignee);
