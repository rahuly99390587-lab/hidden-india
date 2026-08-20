-- -- Hidden India — PostgreSQL schema
-- -- Run via `npm run migrate` (src/migrate.js just executes this file).

-- CREATE EXTENSION IF NOT EXISTS pgcrypto; -- for gen_random_uuid()

-- CREATE TABLE IF NOT EXISTS admin_users (
--   id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   email         TEXT UNIQUE NOT NULL,
--   password_hash TEXT NOT NULL,
--   created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
-- );

-- CREATE TABLE IF NOT EXISTS destinations (
--   id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   slug          TEXT UNIQUE NOT NULL,
--   name_en       TEXT NOT NULL,
--   name_hi       TEXT NOT NULL DEFAULT '',
--   state         TEXT NOT NULL,
--   district      TEXT NOT NULL DEFAULT '',
--   category      TEXT NOT NULL DEFAULT 'heritage',
--   lat           DOUBLE PRECISION NOT NULL,
--   lng           DOUBLE PRECISION NOT NULL,
--   short_en      TEXT NOT NULL DEFAULT '',
--   short_hi      TEXT NOT NULL DEFAULT '',
--   about_en      TEXT NOT NULL DEFAULT '',
--   about_hi      TEXT NOT NULL DEFAULT '',
--   history_en    TEXT NOT NULL DEFAULT '',
--   history_hi    TEXT NOT NULL DEFAULT '',
--   culture_en    TEXT NOT NULL DEFAULT '',
--   culture_hi    TEXT NOT NULL DEFAULT '',
--   best_time_en  TEXT NOT NULL DEFAULT '',
--   best_time_hi  TEXT NOT NULL DEFAULT '',
--   cover_image   TEXT NOT NULL DEFAULT '',
--   status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
--   verified      BOOLEAN NOT NULL DEFAULT false,
--   created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
--   updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
-- );

-- CREATE INDEX IF NOT EXISTS idx_destinations_status ON destinations(status);
-- CREATE INDEX IF NOT EXISTS idx_destinations_state ON destinations(state);
-- CREATE INDEX IF NOT EXISTS idx_destinations_category ON destinations(category);
-- CREATE INDEX IF NOT EXISTS idx_destinations_lat_lng ON destinations(lat, lng);

-- CREATE TABLE IF NOT EXISTS destination_images (
--   id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
--   url            TEXT NOT NULL,
--   alt            TEXT NOT NULL DEFAULT '',
--   sort_order     INTEGER NOT NULL DEFAULT 0
-- );
-- CREATE INDEX IF NOT EXISTS idx_dest_images_dest ON destination_images(destination_id);

-- CREATE TABLE IF NOT EXISTS destination_tips (
--   id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
--   en             TEXT NOT NULL DEFAULT '',
--   hi             TEXT NOT NULL DEFAULT '',
--   sort_order     INTEGER NOT NULL DEFAULT 0
-- );
-- CREATE INDEX IF NOT EXISTS idx_dest_tips_dest ON destination_tips(destination_id);

-- CREATE TABLE IF NOT EXISTS destination_sources (
--   id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
--   organization   TEXT NOT NULL DEFAULT '',
--   title          TEXT NOT NULL DEFAULT '',
--   url            TEXT NOT NULL DEFAULT ''
-- );
-- CREATE INDEX IF NOT EXISTS idx_dest_sources_dest ON destination_sources(destination_id);

-- -- keep updated_at fresh on every UPDATE
-- CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
-- BEGIN
--   NEW.updated_at = now();
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- DROP TRIGGER IF EXISTS trg_destinations_updated_at ON destinations;
-- CREATE TRIGGER trg_destinations_updated_at
--   BEFORE UPDATE ON destinations
--   FOR EACH ROW EXECUTE FUNCTION set_updated_at();

























-- Hidden India — PostgreSQL schema
-- Run via `npm run migrate` (src/migrate.js just executes this file).

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- for gen_random_uuid()

CREATE TABLE IF NOT EXISTS admin_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS destinations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  name_en       TEXT NOT NULL,
  name_hi       TEXT NOT NULL DEFAULT '',
  state         TEXT NOT NULL,
  district      TEXT NOT NULL DEFAULT '',
  category      TEXT NOT NULL DEFAULT 'heritage',
  lat           DOUBLE PRECISION NOT NULL,
  lng           DOUBLE PRECISION NOT NULL,
  short_en      TEXT NOT NULL DEFAULT '',
  short_hi      TEXT NOT NULL DEFAULT '',
  about_en      TEXT NOT NULL DEFAULT '',
  about_hi      TEXT NOT NULL DEFAULT '',
  history_en    TEXT NOT NULL DEFAULT '',
  history_hi    TEXT NOT NULL DEFAULT '',
  culture_en    TEXT NOT NULL DEFAULT '',
  culture_hi    TEXT NOT NULL DEFAULT '',
  best_time_en  TEXT NOT NULL DEFAULT '',
  best_time_hi  TEXT NOT NULL DEFAULT '',
  cover_image   TEXT NOT NULL DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  verified      BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_destinations_status ON destinations(status);
CREATE INDEX IF NOT EXISTS idx_destinations_state ON destinations(state);
CREATE INDEX IF NOT EXISTS idx_destinations_category ON destinations(category);
CREATE INDEX IF NOT EXISTS idx_destinations_lat_lng ON destinations(lat, lng);

CREATE TABLE IF NOT EXISTS destination_images (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  url            TEXT NOT NULL,
  alt            TEXT NOT NULL DEFAULT '',
  sort_order     INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_dest_images_dest ON destination_images(destination_id);

CREATE TABLE IF NOT EXISTS destination_tips (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  en             TEXT NOT NULL DEFAULT '',
  hi             TEXT NOT NULL DEFAULT '',
  sort_order     INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_dest_tips_dest ON destination_tips(destination_id);

CREATE TABLE IF NOT EXISTS destination_sources (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  organization   TEXT NOT NULL DEFAULT '',
  title          TEXT NOT NULL DEFAULT '',
  url            TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_dest_sources_dest ON destination_sources(destination_id);

CREATE TABLE IF NOT EXISTS destination_nearby (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  name           TEXT NOT NULL DEFAULT '',
  distance       TEXT NOT NULL DEFAULT '',
  note           TEXT NOT NULL DEFAULT '',
  sort_order     INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_dest_nearby_dest ON destination_nearby(destination_id);

-- keep updated_at fresh on every UPDATE
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_destinations_updated_at ON destinations;
CREATE TRIGGER trg_destinations_updated_at
  BEFORE UPDATE ON destinations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();