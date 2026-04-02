-- 0001_init_locals_panoramas.up.sql
-- Initial schema for MVP: locals and panoramas.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS locals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(160) NOT NULL,
  address VARCHAR(255) NOT NULL,
  district VARCHAR(120) NOT NULL,
  city VARCHAR(120) NOT NULL,
  category VARCHAR(80) NOT NULL,
  latitude NUMERIC(9, 6) NOT NULL,
  longitude NUMERIC(9, 6) NOT NULL,
  description TEXT,
  image_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_locals_latitude_range CHECK (latitude BETWEEN -90 AND 90),
  CONSTRAINT chk_locals_longitude_range CHECK (longitude BETWEEN -180 AND 180),
  CONSTRAINT chk_locals_image_urls_array CHECK (jsonb_typeof(image_urls) = 'array')
);

CREATE TABLE IF NOT EXISTS panoramas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id UUID NOT NULL,
  title VARCHAR(160) NOT NULL,
  description TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  event_type VARCHAR(80) NOT NULL,
  flyer_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_panoramas_local_id
    FOREIGN KEY (local_id)
    REFERENCES locals(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT chk_panoramas_status CHECK (status IN ('draft', 'published', 'archived')),
  CONSTRAINT chk_panoramas_date_range CHECK (end_at IS NULL OR end_at >= start_at)
);

CREATE INDEX IF NOT EXISTS idx_locals_city_district_category
  ON locals (city, district, category);

CREATE INDEX IF NOT EXISTS idx_locals_latitude_longitude
  ON locals (latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_panoramas_local_id
  ON panoramas (local_id);

CREATE INDEX IF NOT EXISTS idx_panoramas_status_start_at
  ON panoramas (status, start_at);

CREATE INDEX IF NOT EXISTS idx_panoramas_event_type_start_at
  ON panoramas (event_type, start_at);
