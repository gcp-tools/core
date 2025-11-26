# Quality Standards

## Overview

This document covers testing standards, code style, naming conventions, and quality checklists used throughout the platform.

## Testing Standards

### Test Structure

- Unit tests for commands and services
- Integration tests for routes
- Test helpers (builders, fixtures, mocks)
- AAA pattern (Arrange, Act, Assert)

### Coverage Requirements

**Unit Tests:**
- Lines: 100%
- Functions: 100%
- Branches: 100%
- Statements: 100%

**Integration Tests:**
- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

**Rationale:**
- Unit tests focus on isolated business logic and should achieve complete coverage
- Integration tests cover HTTP routes and repository interactions where 100% coverage may be impractical
- Different thresholds reflect the different testing goals

### Vitest Configuration

Services require separate Vitest configurations for unit and integration tests:

**vitest.config.unit.mts:**
- Tests: `src/commands/**/*.mts` and `src/io/services/**/*.mts`
- Timeout: 5 seconds
- Coverage threshold: 100% (all metrics)
- Coverage directory: `./coverage/unit`
- Pool: `forks` for test isolation

**vitest.config.integration.mts:**
- Tests: `src/routes/**/*.mts` and `src/io/repo/**/*.mts`
- Timeout: 10 seconds (longer for external dependencies)
- Coverage threshold: 80% (all metrics)
- Coverage directory: `./coverage/integration`
- Pool: `forks` for test isolation
- Setup file: `./tests/setup.mts` (for Firestore initialization, etc.)

**Key Requirements:**
- Set environment variables before any module imports in config files
- Use `pool: 'forks'` to ensure test isolation
- Separate coverage directories prevent conflicts
- Integration tests require setup file for database/service initialization

### Test Example

```typescript
test('should create application', async () => {
  // Arrange
  const data = buildApplication()
  const mockRepo = createMockRepo()
  
  // Act
  const result = await create({ repo: mockRepo }, ctx, logger)(data)
  
  // Assert
  expect(result.ok).toBe(true)
  expect(result.value).toMatchObject(data)
})
```

## Code Style

### Formatting

- 2-space indentation
- 80 character line limit
- Single quotes for strings
- Trailing commas in multi-line structures
- Semicolons only when necessary

### Biome Configuration

Biome handles linting and formatting. Run `npm run lint` before committing.

## Naming Conventions

- Files: `kebab-case.mts`
- Exports: `camelCase`
- Types: `PascalCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Schemas: `camelCase` + `Schema` suffix

## Import Organization

Order imports by source:

1. Node built-ins
2. External packages
3. Internal packages
4. Local imports

Use `import type` for type-only imports.

## Code Review Checklist

### General
- Types explicit (no `any`)
- Function return types declared
- No unused variables/parameters
- Consistent naming

### Architecture
- Correct layer separation
- Result types used
- Validation at boundaries
- Audit fields handled

### Testing
- Unit tests for commands
- Integration tests for routes
- Both success and error paths tested
- Coverage meets requirements

### Security
- Input validation with Zod
- No sensitive data in logs
- RBAC enforced
- Secrets not hardcoded

## Measure Twice, Cut Once

Always verify work is complete:

1. Read instructions first
2. Complete implementation
3. Read instructions again
4. Verify all requirements met
5. Update if anything missed

## See Also

- [Implementation Patterns](./02-patterns.md) - Code patterns
- [Workflow Guide](./05-workflow.md) - Development workflow

