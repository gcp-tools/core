# Core Principles

> **PHASE:** architecture, implementation
> **PRIORITY:** REQUIRED

## Quick Reference

- [ ] Result types: Use Result<T> for all business logic errors
- [ ] Factory functions: Use curried functions for dependency injection
- [ ] Explicit over implicit: Make dependencies, errors, and types explicit
- [ ] Validation at boundaries: Validate once at HTTP/DB/service boundaries
- [ ] Layered architecture: HTTP → Command → Repository/Service
- [ ] Separation of Concerns: Each layer has one responsibility
- [ ] Single Responsibility: Each module/function has one reason to change
- [ ] Loose Coupling, High Cohesion: Independent modules, related functionality grouped
- [ ] Composition Over Inheritance: Build with functions, not class hierarchies
- [ ] Immutability: Prefer readonly properties and const assertions

## REQUIRED Patterns

### Result Type System

**When to use:** All business logic operations, repository functions, command functions

**Signature:**
```typescript
type Result<T> = { ok: true; value: T } | { ok: false; error: AppError }

type AppError = {
  code: 'NOT_FOUND' | 'CONFLICT' | 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'SERVICE_UNAVAILABLE'
  message: string
  cause?: Error | unknown
  data?: unknown
}
```

**Example:**
```typescript
const result = await repo.getUser(id)
if (!result.ok) return result
const user = result.value
```

**Rules:**
- MUST: Use Result<T> for all repository and command functions
- MUST NOT: Throw exceptions for business logic errors
- MUST: Propagate errors by returning result unchanged
- SHOULD: Include context in error.data field

### Factory Function Pattern

**When to use:** All IO functions (repositories, services, commands)

**Signature:**
```typescript
type RepoFn<A, R> = (db, ctx, logger) => (args: A) => Promise<Result<R>>
type ServiceFn<A, R> = (ctx, logger) => (args: A) => Promise<R>
type CommandFn<A, R, Re = null, Se = null, Au = null> = (
  deps: { repo: Re; services: Se; auth: Au },
  ctx: RequestContext,
  logger: Logger,
) => (args: A) => Promise<Result<R>>
```

**Example:**
```typescript
// Repository function
export const getUser: RepoFn<string, User> =
  (db, ctx, logger) => async (id) => {
    // Implementation
    return { ok: true, value: user }
  }

// Command function (5 type parameters: A, R, Re, Se, Au)
export const createUser: CommandFn<Request, Response, Repo, Services, Auth> =
  ({ repo, services, auth }, ctx, logger) => async (data) => {
    // Implementation using repo, services, and auth
    return { ok: true, value: result }
  }

// Command with only repo (services and auth default to null)
export const getApplication: CommandFn<Request, Response, Repo, null, null> =
  ({ repo }, ctx, logger) => async (data) => {
    // Implementation using only repo
    return { ok: true, value: result }
  }
```

**Rules:**
- MUST: Use curried functions for dependency injection
- MUST: Pass dependencies explicitly in first call
- MUST: Use full CommandFn signature with 5 type parameters (Re, Se, Au default to null if unused)
- MUST NOT: Use class-based DI or service locators
- SHOULD: Apply dependencies once, reuse wrapped function

### Layered Architecture

**When to use:** All service implementations

**Structure:**
```
HTTP Layer → Command Layer → Repository/Service Layer
```

**Layer Responsibilities:**
- HTTP: Route definition, request parsing, response formatting
- Command: Business logic orchestration, workflow coordination
- Repository: Data access patterns, CRUD operations
- Service: External API integration, third-party services

**Rules:**
- MUST: Keep layers separate with clear boundaries
- MUST NOT: Mix concerns across layers
- MUST: HTTP layer depends on Commands, not Repositories
- MUST: Commands depend on Repositories/Services, not HTTP
- SHOULD: Each layer has one reason to change

### Validation at Boundaries

**When to use:** HTTP entry points, database writes, external service responses

**Pattern:**
```typescript
// HTTP boundary
const validated = requestSchema.parse(req.body)

// DB boundary
const document = fullSchema.parse(data)

// Service boundary
const response = responseSchema.parse(apiResponse)
```

**Rules:**
- MUST: Validate once at system boundaries
- MUST NOT: Validate same data multiple times
- MUST: Trust data after boundary validation
- SHOULD: Use Zod schemas for validation

### Separation of Concerns (SoC)

**When to use:** All module and function design

**Principle:** Divide application into distinct, independent sections. Goal is composability—self-contained "Lego brick" components.

**Rules:**
- MUST: Group related functionality together
- MUST: Keep unrelated concerns separate
- MUST: Design for composability
- SHOULD: Each component has clear, single purpose

### Single Responsibility Principle (SRP)

**When to use:** All modules, classes, and functions

**Principle:** Each module/function should have one reason to change.

**Rules:**
- MUST: Each function has one clear purpose
- MUST: Each module represents one entity/concept
- MUST NOT: Create "god objects" with multiple responsibilities
- SHOULD: Functions compose into larger operations

### Loose Coupling, High Cohesion

**When to use:** All module design

**Coupling (Low is Good):**
- Modules can change independently
- Easy to replace implementations
- Clear interfaces
- Minimal dependencies

**Cohesion (High is Good):**
- Related functionality grouped
- Single responsibility
- Easy to understand
- Easy to name

**Rules:**
- MUST: Depend on abstractions, not implementations
- MUST: Use message passing, not shared state
- MUST: Group related functionality together
- SHOULD: Minimize dependencies between modules

### Composition Over Inheritance

**When to use:** Building complex behavior

**Principle:** Build complex behavior by composing simple functions, not by inheriting from classes.

**Example:**
```typescript
const validate = (data) => {...}
const transform = (data) => {...}
const save = (data) => {...}

const createUser = async (data) => {
  const validated = validate(data)
  const transformed = transform(validated)
  return await save(transformed)
}
```

**Rules:**
- MUST: Prefer function composition over class inheritance
- MUST: Use type composition for types
- MUST NOT: Create deep inheritance hierarchies
- SHOULD: Build with small, focused functions

### Explicit Over Implicit

**When to use:** All code

**Principle:** Code should clearly express what it does, what it depends on, and how it can fail.

**Rules:**
- MUST: Use explicit dependency injection
- MUST: Use explicit error handling via Result types
- MUST: Use explicit validation at boundaries
- MUST: Use explicit type definitions
- MUST NOT: Use global state or hidden dependencies

### Predictability (POLA)

**When to use:** All function design

**Principle:** Functions should behave consistently and not surprise users. Contracts (inputs, outputs, failures) must be clear and reliable.

**Rules:**
- MUST: Use consistent function signatures across layers
- MUST: Use predictable error codes
- MUST: Use standard context types
- SHOULD: Use uniform logging patterns

### Least Context

**When to use:** All component design

**Principle:** Component should require absolute minimum external context. No assumptions about environment.

**Rules:**
- MUST: Pass dependencies explicitly
- MUST: Context objects contain only necessary fields
- MUST NOT: Use global state
- MUST NOT: Make assumptions about environment

### Immutability Preference

**When to use:** All data structures

**Pattern:**
```typescript
type User = {
  readonly id: string
  readonly name: string
}

const config = { timeout: 5000 } as const
const updated = { ...existing, name: 'New' }
```

**Rules:**
- MUST: Use readonly for immutable properties
- MUST: Use const assertions for literal types
- SHOULD: Prefer immutable data structures
- MUST NOT: Mutate function parameters or shared state

### Schema Hierarchy

**When to use:** All entity definitions

**Four Levels:**
1. Full Schema: Complete database document
2. Create Schema: Without generated/audit fields
3. Request Schema: User-facing (often same as create)
4. Update Schema: Partial with required ID

**Example:**
```typescript
const entitySchema = z.object({ id, name, createdAt, updatedAt })
const entityCreateSchema = entitySchema.omit({ id, createdAt, updatedAt })
const entityUpdateSchema = z.intersection(
  entitySchema.pick({ id: true }),
  entitySchema.omit({ id, createdAt }).partial()
)
```

**Rules:**
- MUST: Define four-level schema hierarchy
- MUST: Use Full schema for database operations
- MUST: Use Create schema for new documents
- MUST: Use Update schema for partial updates

### Audit Fields

**When to use:** All mutable documents

**Fields:**
```typescript
type AuditFields = {
  readonly createdAt: Timestamp
  readonly updatedAt: Timestamp
  readonly createdBy: string
  readonly updatedBy: string
}
```

**Rules:**
- MUST: Include audit fields in all mutable documents
- MUST: Set createdAt/createdBy on create
- MUST: Update updatedAt/updatedBy on update
- MUST: Use ctx.userId for createdBy/updatedBy

## REFERENCE Patterns

### DRY (Don't Repeat Yourself)

**Rule of Three:** Wait for three uses before abstracting
- First use: Write it
- Second use: Duplicate (note similarity)
- Third use: Abstract (pattern is clear)

**Rules:**
- SHOULD: DRY business rules, data transformations, validation logic
- MUST NOT: DRY coincidentally similar code
- MUST NOT: Abstract prematurely

### KISS (Keep It Simple, Stupid)

**Rules:**
- SHOULD: Choose simple algorithm over clever one
- SHOULD: Choose boring solution over novel one
- MUST NOT: Add unnecessary complexity
- MUST NOT: Over-engineer solutions

### YAGNI (You Ain't Gonna Need It)

**Rules:**
- MUST NOT: Add functionality until required
- MUST NOT: Build "just in case" features
- MUST NOT: Create speculative abstractions
- SHOULD: Build only current requirements

### Code Smells

**Common Smells:**
- Long Methods: Hard to understand, multiple responsibilities
- Large Classes: God objects, doing too much
- Duplicated Code: DRY violation
- Long Parameter Lists: Too much context needed
- Primitive Obsession: Using primitives instead of domain objects

**Rules:**
- SHOULD: Identify and refactor code smells
- MUST: Understand underlying problem before refactoring
- MUST: Test after refactoring

## Decision Trees

**Q: Should I use Result<T> or throw an exception?**

- Business logic error → Use Result<T>
- Validation failure → Use Result<T>
- Not found/conflict → Use Result<T>
- Infrastructure failure → Throw exception (caught by wrapper)
- Programming error → Throw exception (caught by errorHandler)

**Q: What layer should this code go in?**

- HTTP concerns (routing, parsing) → HTTP Layer
- Business logic orchestration → Command Layer
- Data access (CRUD, queries) → Repository Layer
- External API calls → Service Layer

**Q: How do I handle errors?**

- Repository/Service error → Return Result<T>
- Command error → Propagate Result<T> or create business error
- HTTP error → Convert Result<T> to HTTP response
- Unexpected error → Let errorHandler middleware catch

**Q: Should I abstract this duplication?**

- First occurrence → Write it
- Second occurrence → Duplicate, note similarity
- Third occurrence → Abstract (pattern is clear)
- Coincidentally similar → Keep separate

