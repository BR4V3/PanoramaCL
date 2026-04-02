# Copilot Working Rules for PanoramaCL

These rules apply to all AI-assisted changes in this repository.

## Core principles

1. Preserve existing behavior. Avoid regressions.
2. Prefer simple, readable solutions over clever complexity.
3. Keep architecture modular and domain-oriented.
4. Do not add dependencies unless explicitly approved.

## Architecture guardrails

- Frontend must keep separation between UI, business logic, and services.
- Backend must keep module boundaries (controller, service, repository, dto).
- Business logic belongs in services/use-cases, not in controllers/components.

## Data and naming

- Use English names in code and database identifiers.
- Keep DB fields in snake_case.
- Keep API payloads in camelCase.
- Avoid duplicate sources of truth.

## API standards

- Follow REST resource naming.
- Keep endpoint responsibilities focused.
- Use typed, consistent error responses.
- Keep /api/v1 namespace.

## Map integration

- Use provider adapter abstraction.
- Avoid coupling feature logic to a specific map SDK.
- Keep map interactions behind a map service boundary.

## Quality gates for every change

Before finalizing any change:
1. Identify regression risk
2. Provide validation strategy
3. Add or update tests for critical logic
4. Remove dead code, unused imports, and temporary alternatives

## MVP product focus

- Prioritize user path to discover plans quickly.
- Reject non-essential features that do not improve discoverability.
- Keep delivery iterative: functional first, then optimize.
