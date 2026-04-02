# API Endpoints v1 (Initial)

Base path: /api/v1

## Locals

- GET /locals
  - Query: city, district, category, minLat, minLng, maxLat, maxLng, limit, offset
- GET /locals/:id
- POST /locals
- PATCH /locals/:id

## Events

- GET /events
  - Query: localId, eventType, status, startAtFrom, startAtTo, limit, offset
- GET /events/:id
- POST /events
- PATCH /events/:id

## Notes

- Canonical DB tables remain locals and panoramas.
- Events endpoint is an API naming alias aligned with product language.
- DTO validation middleware/pipes should be added when framework bootstrap is created.
