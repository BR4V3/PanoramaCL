---
applyTo: "**"
description: "Use when editing PanoramaCL. Enforce architecture, API consistency, map abstraction, MVP scope discipline, and no-regression delivery."
---

# PanoramaCL Project Standards

## Non-negotiables

- Do not break existing behavior.
- Call out any regression risk explicitly.
- Propose concrete validation steps for risky changes.
- Do not add external libraries without user approval.

## Frontend standards

- Keep component-based architecture.
- Keep UI, hooks/state, and services separated.
- Avoid API calls directly inside presentation components.
- Reuse shared components instead of duplicating UI blocks.

## Backend standards

- Use modular domain structure.
- Keep controller/service/repository/dto split per module.
- Keep validations at DTO boundary.
- Keep business rules in services, not in controllers.

## Data and API standards

- Prefer English names for entities and fields in code.
- Keep relation Local -> Panoramas clear.
- Follow REST conventions and consistent endpoint naming.
- Keep API contracts backward compatible when possible.

## Map and search standards

- Keep map provider implementation behind adapter/service.
- Implement combinable filters from backend.
- Optimize map queries by bounds, date, and pagination limits.

## Product scope discipline

- Each feature must improve discoverability of plans.
- Prioritize MVP core flow over optional extras.
- Avoid overengineering in V1.

## Definition of done

- Acceptance criteria fulfilled
- Regression risk reviewed
- Validation/test steps defined
- Dead code and unused imports removed
- Relevant docs updated
