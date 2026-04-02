# Database Schema (MVP)

Version: 0001
Database: PostgreSQL

## Entities

### locals

- id (uuid, pk)
- name (varchar)
- address (varchar)
- district (varchar)
- city (varchar)
- category (varchar)
- latitude (numeric 9,6)
- longitude (numeric 9,6)
- description (text, nullable)
- image_urls (jsonb array)
- created_at (timestamptz)
- updated_at (timestamptz)

### panoramas

- id (uuid, pk)
- local_id (uuid, fk -> locals.id)
- title (varchar)
- description (text, nullable)
- start_at (timestamptz)
- end_at (timestamptz, nullable)
- event_type (varchar)
- flyer_url (text, nullable)
- status (draft | published | archived)
- created_at (timestamptz)
- updated_at (timestamptz)

## Relationship

- One local has many panoramas.
- A panorama belongs to one local.

## Constraints

- Latitude/longitude range validation.
- Panorama date validation: end_at >= start_at.
- Panorama status restricted to draft/published/archived.
- image_urls must be a JSON array.

## Indexes

- locals(city, district, category)
- locals(latitude, longitude)
- panoramas(local_id)
- panoramas(status, start_at)
- panoramas(event_type, start_at)

## Migration files

- apps/api/src/database/migrations/0001_init_locals_panoramas.up.sql
- apps/api/src/database/migrations/0001_init_locals_panoramas.down.sql
