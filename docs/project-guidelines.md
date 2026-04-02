# Project Rules and Guidelines (MVP)

Version: 1.0
Scope: PanoramaCL (web + api)
Goal: keep clarity, simplicity, and scalability without breaking existing behavior.

## 1. Product North Star

Every change must answer:
- Does this help users discover plans faster?
- Can users find a plan in <= 3 clicks from the main map flow?

If the answer is no, move it out of MVP.

## 2. Golden Rules

Priority order:
1. Clarity
2. Simplicity
3. Scalability

Never optimize early if it adds complexity without clear MVP value.

## 3. UX and Design System

### 3.1 Design tokens only
- No hardcoded colors in components.
- Use semantic tokens from a single source.
- Required token groups: color, spacing, radius, typography, shadow, z-index.

Base color tokens (initial):
- color.primary = #4F46E5
- color.secondary = #22C55E
- color.background = #F9FAFB
- color.text = #111827
- color.error = #EF4444
- color.warning = #F59E0B
- color.success = #10B981

### 3.2 Typography
- Max 2 font families.
- Use fixed type scale (no arbitrary font sizes).
- Define style roles: display, h1, h2, h3, body, caption.

### 3.3 Reusable components
- Buttons, inputs, cards, tags, modals, toasts must be reusable.
- If UI appears in 2 places, extract component.

## 4. Frontend Architecture Rules

Recommended structure:
- app/ or pages/
- components/
- features/
- hooks/
- services/
- lib/
- styles/

Separation of concerns:
- components: presentational UI
- features: business use-cases by domain
- hooks: local orchestration and UI state
- services: API clients and side effects

Do not put API fetch logic directly in UI components.

## 5. Backend Architecture Rules

Use modular architecture by domain:
- modules/locales
- modules/panoramas
- modules/search
- modules/admin

Each module must include:
- controller
- service
- repository (or ORM adapter)
- dto (input/output contracts)

Service layer owns business rules. Controller only maps HTTP to use cases.

## 6. Data Modeling Rules

Canonical entities:
- Local
- Panorama (optional alias: Event in API contract if required later)

Rules:
- Keep one-to-many relation: Local -> Panoramas
- Avoid duplicated descriptive data across entities
- Use consistent naming in English for code and DB identifiers

Recommended standard:
- Tables and fields in snake_case
- API payloads in camelCase

## 7. API Design Rules

REST conventions:
- GET /locals
- GET /locals/:id
- POST /locals
- PATCH /locals/:id
- GET /events
- GET /events/:id
- POST /events
- PATCH /events/:id

Rules:
- Keep endpoint responsibilities narrow
- Use predictable status codes
- Return typed error objects
- Version API from day one: /api/v1

## 8. Map Integration Rules

- Use a map provider adapter abstraction (Mapbox/Google interchangeable).
- No provider SDK calls from feature business logic.
- Create mapService as integration boundary.

Minimum map contract:
- setCenter
- setZoom
- getBounds
- renderMarkers
- onBoundsChanged

## 9. Filters and Search Rules

- Filtering logic must run in backend, not only frontend.
- Support combinable filters: city, district, type, category, date range.
- Add indexes for common filters and date sorting.

## 10. Security Rules (MVP baseline)

- Validate all input DTOs at backend boundary.
- Sanitize strings before persistence/output where relevant.
- Never expose stack traces to clients.
- Use centralized error handling middleware/filter.
- Protect admin routes with authentication.

## 11. Testing Rules

Minimum required tests before release:
- Service unit tests for core rules
- Integration tests for critical endpoints:
  - list locals by bounds
  - list panoramas by local and date
  - create/edit local and panorama in admin

No feature is done without at least one happy-path test.

## 12. Performance Rules

- Use lazy loading in frontend route chunks.
- Paginate list endpoints.
- For map endpoints, query by bounds + limit.
- Avoid loading complete details for marker lists.

## 13. Scalability Rules

Design for growth without overengineering:
- No hardcoded city names.
- Keep categories dynamic/configurable.
- Keep provider integrations behind adapters.

## 14. Definition of Done (DoD)

A task is done only if:
1. Meets acceptance criteria
2. Includes tests (or justified exception)
3. Includes error and empty-state handling
4. Preserves existing behavior (no regression)
5. Includes minimal docs update if contract changed

## 15. Delivery Iterations

- V1: functional MVP (core map flow + admin CRUD)
- V2: UX and performance improvements
- V3: scale to multiple cities/providers

## 16. Change Management

Before merge:
- Describe risk of regression
- Describe mitigation and validation steps
- Keep backward compatibility for existing API contracts when possible

## 17. Out of Scope for MVP

- Recommendation engines
- Social features
- Complex personalization
- Advanced analytics dashboards

Keep MVP focused on discoverability and reliable data quality.
