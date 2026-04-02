-- 0001_init_locals_panoramas.down.sql
-- Rollback for initial schema.

DROP INDEX IF EXISTS idx_panoramas_event_type_start_at;
DROP INDEX IF EXISTS idx_panoramas_status_start_at;
DROP INDEX IF EXISTS idx_panoramas_local_id;
DROP INDEX IF EXISTS idx_locals_latitude_longitude;
DROP INDEX IF EXISTS idx_locals_city_district_category;

DROP TABLE IF EXISTS panoramas;
DROP TABLE IF EXISTS locals;
