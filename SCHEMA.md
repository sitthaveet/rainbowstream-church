# Database Schema
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Basic identity
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    nickname VARCHAR(100),
    birthdate DATE NOT NULL,

    -- Contact
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(50) NOT NULL,
    address TEXT,
    line_id VARCHAR(100),

    -- Personal profile
    sex_at_birth VARCHAR(20) NOT NULL CHECK (
        sex_at_birth IN ('male', 'female', 'intersex')
    ),

    identity_orientation VARCHAR(50) NOT NULL CHECK (
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
    christian_duration VARCHAR(50) NOT NULL CHECK (
        christian_duration IN (
            'not_christian',
            '1_3_years',
            '3_10_years',
            'more_than_10_years'
        )
    ),
    church VARCHAR(255),

    self_introduction TEXT,

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

    -- Pastor who created the event
    created_by UUID NOT NULL REFERENCES users(id),

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