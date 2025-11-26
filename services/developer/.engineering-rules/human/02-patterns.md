# Implementation Patterns

## Overview

This document covers TypeScript standards and implementation patterns for building services. It includes function signatures, layer patterns, validation strategies, and Hono framework usage.

## TypeScript Standards

### Code Style

- 2-space indentation
- 80 character line limit
- Single quotes for strings
- Trailing commas in multi-line structures
- Semicolons only when necessary

### Type Safety

- Enable strict mode
- Never use `any` type
- Explicit return types for functions
- Use types, not interfaces
- Readonly for immutable properties
- Const assertions for literal types
- ESM syntax for imports/exports
- Prefer functions over classes

## Function Signatures

### Repository Functions

```typescript
type FirestoreRepoFn<A, R> = (
  db: Firestore,
  ctx: RequestContext,
  logger: Logger,
) => (args: A) => Promise<Result<R>>
```

### Service Functions

```typescript
type ServiceFn<A, R> = (
  ctx: RequestContext,
  logger: Logger,
) => (args: A) => Promise<R>
```

### Command Functions

```typescript
type CommandFn<A, R, Re = null, Se = null, Au = null> = (
  deps: { repo: Re; services: Se; auth: Au },
  ctx: RequestContext,
  logger: Logger,
) => (args: A) => Promise<Result<R>>
```

## Layer Patterns

### Repository Layer

Handles all Firestore data access:

- Generate UUIDs for new documents
- Use Timestamp.now() for timestamps
- Validate with Zod before writing
- Add audit fields automatically
- Return Result<T> for all operations

### Command Layer

Orchestrates business logic:

- Log input at start
- Call repositories/services
- Propagate errors unchanged
- Log success with result
- Return Result<T>
- **Do NOT re-validate input** - trust that `zValidator` in routes has already validated the request schema
- **Exception**: Additional validation allowed if explicitly required by brief (e.g., cross-field validation, business rules, database lookups)

### Service Layer

**Important**: Service Layer patterns are **only for apps** calling services. Services cannot call other services.

Integrates with external services:

- Use typed Hono clients (apps only)
- Infer request/response types
- Forward correlation ID and user headers
- Throw on HTTP errors (wrapper converts to Result)
- Services must NOT include `io/services/` directory

## Schema Hierarchy

Four-level hierarchy:

1. **Full Schema**: Complete database document
2. **Create Schema**: Without generated/audit fields
3. **Request Schema**: User-facing (often same as create)
4. **Update Schema**: Partial with required ID

Always infer types from schemas using `z.infer`.

## Context Middleware

### Services vs Apps

**Services** use `tenantContext` middleware:
- Extracts `TenantContext` from headers (x-tenant-id, x-user-id, x-correlation-id, x-role)
- Used for service-to-service calls from apps
- Example: `app.use(tenantContext)`

**Apps** use `context` middleware:
- Extracts `RequestContext` from JWT (x-apigateway-api-userinfo)
- Includes organisation info from JWT claims
- Used for user requests from API Gateway
- Example: `app.use(context)`

## Hono Patterns

### Route Definition

```typescript
const app = new Hono<{ Variables: AppContext & RepoContext & CommandContext }>()

app.use(async (c, next) => {
  c.set('repoFns', repoFns)
  c.set('cmdFns', cmdFns)
  await next()
})

app.use(initFirestoreRepo())
app.use(initCommands())

app.post('/', requireRole('platform'), zValidator('json', schema), async (c) => {
  const { create } = c.get('cmds')
  const result = await create(c.req.valid('json'))
  return resultToResponse(result, 201)(c)
})
```

## Validation Boundaries

Validation occurs at specific boundaries in the layered architecture:

1. **HTTP Layer**: Uses `zValidator('json', requestSchema)` to validate incoming requests (schema, types, required fields)
2. **Command Layer**: Receives already-validated data via `c.req.valid('json')` and uses it directly. Only adds additional validation if explicitly required by brief (e.g., business rules, cross-field validation, database lookups)
3. **Repository Layer**: Validates with full schema before writing to database

**Key Rule**: Commands should NOT re-validate the request schema - it's already validated by `zValidator` in routes. Only add validation in commands if the brief specifically requires it.

## See Also

- [Core Principles](./00-principles.md) - Architectural foundation
- [Quality Standards](./03-quality.md) - Testing and code quality

