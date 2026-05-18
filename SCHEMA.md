# Database Schema
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- LINE identity: the LIFF userId (sub), known at first login.
    -- This is the only field populated when an account is auto-created;
    -- everything else is filled in later via the registration form.
    line_id VARCHAR(100) NOT NULL UNIQUE,

    -- Profile fields below are NULL until the user completes registration.

    -- Basic identity
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    nickname VARCHAR(100),
    birthdate DATE,

    -- Contact
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(50),
    address TEXT,

    -- Personal profile
    sex_at_birth VARCHAR(20) CHECK (
        sex_at_birth IN ('male', 'female', 'intersex')
    ),

    identity_orientation VARCHAR(50) CHECK (
        identity_orientation IN (
            'gay_lesbian',
            'bisexual',
            'straight',
            'transgender',
            'other'
        )
    ),
    identity_orientation_other TEXT,

    -- Christian background
    -- Number of years the user has been a Christian (0 = not a Christian).
    christian_duration INTEGER CHECK (christian_duration >= 0),
    church VARCHAR(255),

    self_introduction TEXT,

    -- Gamification: points earned by the user (e.g. via event check-ins)
    points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),

    -- Access role
    role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (
        role IN ('pastor', 'member')
    ),

    -- System fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Event details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location TEXT,

    -- Schedule
    starts_at TIMESTAMP NOT NULL,
    ends_at TIMESTAMP,

    -- Check-in: code embedded in the QR attendees scan at the event
    checkin_code VARCHAR(100) NOT NULL UNIQUE DEFAULT gen_random_uuid(),

    -- Pastor who created the event. Nullable with ON DELETE SET NULL so an
    -- event stands on its own and outlives the pastor who created it.
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,

    -- System fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CHECK (ends_at IS NULL OR ends_at >= starts_at)
);

CREATE TABLE checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    checked_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- An attendee can only check in once per event
    UNIQUE (event_id, user_id)
);

-- Indexes
--
-- Note: UNIQUE (event_id, user_id) on checkins already provides a btree
-- index led by event_id, so "all checkins for an event" is covered — no
-- separate index on checkins.event_id is needed. The index below covers
-- the other direction ("all events a user checked into").
CREATE INDEX idx_checkins_user_id ON checkins(user_id);

-- "Events created by a given pastor"
CREATE INDEX idx_events_created_by ON events(created_by);

-- updated_at trigger
--
-- Keeps updated_at current on every row UPDATE (DEFAULT only sets it on INSERT).
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_set_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER events_set_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();