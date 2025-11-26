# Quality Standards

> **PHASE:** testing, review, implementation
> **PRIORITY:** REQUIRED

## Quick Reference

- [ ] Testing: AAA pattern, unit tests for commands, integration tests for routes
- [ ] Code Style: 2-space indent, 80 chars, single quotes, trailing commas
- [ ] Naming: kebab-case files, camelCase exports, PascalCase types
- [ ] Imports: node → external → internal → local
- [ ] Review: Checklist for types, architecture, testing, security
- [ ] Measure Twice: Read instructions twice, verify all requirements met

## REQUIRED Patterns

### Testing Standards

**When to use:** All code implementation

**Test Structure:**
```
tests/
├── helpers/          # Test utilities
├── integration/      # Integration tests (routes)
└── unit/            # Unit tests (commands, services)
```

**AAA Pattern:**
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

**Coverage Requirements:**
- Unit tests: Lines 100%, Functions 100%, Branches 100%, Statements 100%
- Integration tests: Lines 80%, Functions 80%, Branches 80%, Statements 80%

**Vitest Configuration:**
- MUST: Use separate configs: `vitest.config.unit.mts` and `vitest.config.integration.mts`
- MUST: Unit config tests `src/commands/**/*.mts` and `src/io/services/**/*.mts`
- MUST: Integration config tests `src/routes/**/*.mts` and `src/io/repo/**/*.mts`
- MUST: Unit tests use 5s timeout, integration use 10s timeout
- MUST: Use `pool: 'forks'` for test isolation
- MUST: Set environment variables before module imports in config files
- MUST: Use `tests/setup.mts` for integration test setup

**Rules:**
- MUST: Write unit tests for all commands
- MUST: Write integration tests for all routes
- MUST: Use AAA pattern (Arrange, Act, Assert)
- MUST: Test both success and error paths
- MUST: Use test helpers (builders, fixtures, mocks)
- MUST: Achieve 100% coverage for unit tests
- MUST: Achieve 80% coverage for integration tests
- MUST: Use vitest for testing
- MUST: Use separate vitest configs for unit and integration tests
- MUST: Mock external dependencies appropriately

### Code Style Standards

**When to use:** All code

**Formatting:**
- 2-space indentation
- Maximum 80 characters per line
- Single quotes for strings
- Trailing commas in multi-line structures
- Semicolons only when necessary
- Arrow functions with parentheses for parameters

**Biome Configuration:**
```json
{
  "formatter": {
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 80,
    "quoteStyle": "single",
    "semicolons": "asNeeded",
    "trailingCommas": "all"
  }
}
```

**Rules:**
- MUST: Use 2-space indentation
- MUST: Keep lines under 80 characters
- MUST: Use single quotes for strings
- MUST: Use trailing commas in multi-line structures
- MUST: Run `npm run lint` before committing
- MUST NOT: Use semicolons unless necessary

### Naming Conventions

**When to use:** All files and exports

**Patterns:**
- Files: `kebab-case.mts` - e.g., `get-by-id.mts`
- Exports: `camelCase` - e.g., `createApplication`
- Types: `PascalCase` - e.g., `Application`
- Constants: `SCREAMING_SNAKE_CASE` - e.g., `MAX_RETRIES`
- Schemas: `camelCase` + `Schema` suffix - e.g., `applicationSchema`

**Rules:**
- MUST: Use kebab-case for all file names
- MUST: Use camelCase for function/variable exports
- MUST: Use PascalCase for type exports
- MUST: Use SCREAMING_SNAKE_CASE for constants
- MUST NOT: Use uppercase in file names
- MUST NOT: Use snake_case for files

### Import Organization

**When to use:** All files

**Order:**
```typescript
// 1. Node built-ins
import { randomUUID } from 'node:crypto'

// 2. External packages
import { z } from 'zod'

// 3. Internal packages
import type { CommandFn } from '@gcp-tools/hono'

// 4. Local imports
import type { Application } from '../schemas/applications.mjs'
```

**Rules:**
- MUST: Organize imports by source
- MUST: Use `import type` for type-only imports
- MUST: Group imports with blank lines
- MUST NOT: Mix import types in same group

### Code Review Checklist

**When to use:** All code reviews

**General:**
- [ ] Types are explicit (no `any`)
- [ ] Function return types declared
- [ ] All imports necessary
- [ ] No unused variables/parameters
- [ ] Consistent naming conventions

**Architecture:**
- [ ] Correct layer separation
- [ ] Result types used for I/O
- [ ] Validation at boundaries
- [ ] Audit fields handled correctly
- [ ] Error handling comprehensive

**Testing:**
- [ ] Unit tests for commands
- [ ] Integration tests for routes
- [ ] Test helpers used
- [ ] Both success and error paths tested
- [ ] Coverage meets requirements

**Security:**
- [ ] Input validation with Zod
- [ ] No sensitive data in logs
- [ ] RBAC enforced
- [ ] Secrets not hardcoded

**Performance:**
- [ ] No N+1 queries
- [ ] Appropriate indexes
- [ ] Pagination for lists
- [ ] Efficient data structures

**Rules:**
- MUST: Complete checklist before marking review complete
- MUST: Verify all requirements met
- MUST: Check both code and tests

### Measure Twice, Cut Once

**When to use:** Before considering work complete

**Principle:** Always double check you have covered everything asked of you by reading the instructions a second time, after completing your implementation, and updating it if you have missed something.

**Verification Steps:**
1. Read original instructions/requirements
2. Complete implementation
3. Read instructions again
4. Verify all requirements met
5. Update implementation if anything missed

**Rules:**
- MUST: Read instructions twice (before and after implementation)
- MUST: Verify all requirements met before marking complete
- MUST: Update implementation if requirements missed
- MUST NOT: Mark work complete without verification

### Documentation Standards

**When to use:** Public APIs and complex logic

**JSDoc Pattern:**
```typescript
/**
 * Creates a new application.
 * @param data - Application creation data
 * @returns Result containing created application or error
 */
export const create: CommandFn<Request, Response, Repo, null, null> =
  ({ repo }, ctx, logger) => async (data) => {
    // Implementation
  }
```

**Rules:**
- MUST: Use JSDoc comments for public APIs
- MUST: Document complex business logic
- SHOULD: Keep README.md up to date
- SHOULD: Document infrastructure decisions

### Git Commit Standards

**When to use:** All commits

**Conventional Commits:**
```
type(scope): description
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructure
- `test`: Tests
- `chore`: Maintenance

**Examples:**
```
feat(management): add application CRUD endpoints
fix(identity): handle null user status
test(applications): add integration tests
```

**Rules:**
- MUST: Use conventional commit format
- MUST: Keep commits focused and atomic
- MUST: Write meaningful commit messages
- MUST: Use proper branch naming (feature/, fix/, refactor/)

## REFERENCE Patterns

### Test Helpers

**Builders:**
```typescript
export const buildApplication = (overrides = {}): ApplicationCreate => ({
  name: overrides.name || 'Test Application',
  status: overrides.status || 'active',
})
```

**Mocks:**
```typescript
export const createMockRepo = (): Repo => ({
  createApplication: vi.fn().mockResolvedValue({ ok: true, value: mockApp }),
})
```

**Rules:**
- SHOULD: Use builders for test data
- SHOULD: Use mocks for external dependencies
- SHOULD: Use fixtures for complex test data

### Common Mistakes

**Anti-Patterns:**
- ❌ Using `any` type
- ❌ Missing return types
- ❌ No validation at boundaries
- ❌ Mixing concerns across layers
- ❌ Throwing exceptions for business logic
- ❌ No tests for error paths
- ❌ Hardcoded secrets
- ❌ N+1 queries

**Rules:**
- MUST NOT: Use any of these anti-patterns
- SHOULD: Identify and refactor anti-patterns
- SHOULD: Review code against checklist

## Decision Trees

**Q: What test should I write?**

- Testing command function → Unit test
- Testing route endpoint → Integration test
- Testing repository function → Integration test (with Firestore)
- Testing service function → Unit test (with mock client)

**Q: How do I verify my work is complete?**

- Read instructions first → Implement → Read instructions again → Verify all requirements → Update if needed

**Q: What commit type should I use?**

- New feature → `feat`
- Bug fix → `fix`
- Tests only → `test`
- Documentation → `docs`
- Code improvement → `refactor`
- Maintenance → `chore`

