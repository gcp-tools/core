# Core Principles

## Overview

This document explains the fundamental architectural principles that guide all service development in the platform. These principles are universal concepts that apply regardless of technology stack, ensuring consistent, maintainable, and testable code.

Understanding these principles is essential before building any new services or features. They form the foundation for all design decisions and code patterns used throughout the platform.

## Table of Contents

- [Quick Start](#quick-start)
- [Core Philosophy](#core-philosophy)
- [Layered Architecture](#layered-architecture)
- [Result Type System](#result-type-system)
- [Factory Function Pattern](#factory-function-pattern)
- [Validation at Boundaries](#validation-at-boundaries)
- [Design Principles](#design-principles)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## Quick Start

If you're new to the platform, start here:

1. **Result Types**: All I/O operations return `Result<T>` instead of throwing exceptions
2. **Factory Functions**: Use curried functions for dependency injection, not classes
3. **Layered Architecture**: Keep HTTP, Command, Repository, and Service layers separate
4. **Validation**: Validate once at system boundaries (HTTP, database, external services)
5. **Explicit Over Implicit**: Make dependencies, errors, and types explicit

## Core Philosophy

### Explicit Over Implicit

**Why**: Code should clearly express what it does, what it depends on, and how it can fail. This makes code easier to understand, test, and maintain.

**How**: Use explicit dependency injection via factory functions, explicit error handling via Result types, explicit validation at boundaries, and explicit type definitions.

**Example**: Instead of a hidden global database connection, pass the database instance explicitly to repository functions.

### Predictability (POLA)

**Why**: Functions should behave consistently and not surprise users. Clear contracts (inputs, outputs, failures) reduce cognitive load and enable confident refactoring.

**How**: Use consistent function signatures across layers, predictable error codes, standard context types, and uniform logging patterns.

**Example**: All repository functions follow the same `FirestoreRepoFn<A, R>` signature, making them predictable and composable.

### Least Context

**Why**: A component should require the absolute minimum external context. This makes components easier to test, reuse, and understand.

**How**: Pass dependencies explicitly, use context objects with only necessary fields, avoid global state, and eliminate hidden dependencies.

**Example**: A repository function only receives the database, context, and logger it needs—nothing more.

## Layered Architecture

### The Pattern

The platform uses a strict layered architecture:

```
HTTP Layer (Presentation)
    ↓
Command Layer (Application)
    ↓
Repository/Service Layer (Data/Infrastructure)
```

### Why Layers?

**Separation of Concerns**: Each layer has one reason to change. HTTP layer changes don't affect business logic, and database changes don't affect commands.

**Composability**: Layers compose naturally. Commands can call multiple repositories/services, and repositories can be reused across commands.

**Maintainability**: Changes are localized to the appropriate layer, making the codebase easier to understand and modify.

### Layer Responsibilities

**HTTP Layer**:
- Route definition
- Request parsing
- Response formatting
- Authentication/authorization
- **Not**: Business logic, data access, external service calls

**Command Layer**:
- Business logic orchestration
- Workflow coordination
- Multi-step operations
- **Not**: HTTP concerns, direct data access details

**Repository Layer**:
- Data access patterns
- CRUD operations
- Queries
- **Not**: Business logic, external APIs

**Service Layer**:
- External API integration
- Third-party services
- **Not**: Business logic, data persistence

## Result Type System

### Why Result Types?

Instead of using exceptions for error handling, the platform uses Result types:

```typescript
type Result<T> = { ok: true; value: T } | { ok: false; error: AppError }
```

**Benefits**:
- ✅ Errors are part of the type system
- ✅ Forces explicit error handling
- ✅ Type-safe error propagation
- ✅ No hidden control flow
- ✅ Clear what can fail

**Problems with exceptions**:
- ❌ Hidden control flow
- ❌ Not in type system
- ❌ Easy to forget to handle
- ❌ Unclear what can throw

### Usage Pattern

```typescript
const result = await repo.getUser(id)

if (!result.ok) {
  logger.error({ error: result.error }, 'Failed to get user')
  return result  // Propagate error
}

// TypeScript knows result.value exists here
const user = result.value
```

## Factory Function Pattern

### Why Factory Functions?

Factory functions provide better type safety, testability, and explicitness compared to class-based dependency injection.

**Benefits**:
- ✅ Full TypeScript inference
- ✅ Easy to mock for testing
- ✅ Clear dependency requirements
- ✅ No magic or decorators
- ✅ Functions compose naturally

### The Pattern

```typescript
export type RepoFn<A, R> = (
  db: Firestore,
  ctx: RequestContext,
  logger: Logger,
) => (args: A) => Promise<Result<R>>

export const getUser: RepoFn<string, User> =
  (db, ctx, logger) => async (id) => {
    // Implementation with access to db, ctx, logger
    return { ok: true, value: user }
  }

// Usage: Apply dependencies once
const wrapped = getUser(db, ctx, logger)

// Then call with just args
const result = await wrapped(id)
```

## Validation at Boundaries

### The Principle

Validate once at system boundaries, then trust the data internally.

**Boundaries**:
1. HTTP boundary: Validate all incoming requests
2. Database boundary: Validate before write
3. External service boundary: Validate responses

**Why**: Fail fast, clear error messages, internal code can trust data, single source of validation logic.

**Example**: Validate request body at the HTTP route using `zValidator`, then trust the validated data throughout the command and repository layers.

## Design Principles

### Separation of Concerns (SoC)

Divide the application into distinct, independent sections. The goal is composability—producing self-contained "Lego brick" components.

**How**: Group related functionality together, keep unrelated concerns separate, design for composability.

### Single Responsibility Principle (SRP)

Each module/function should have one reason to change.

**How**: Each function has one clear purpose, each module represents one entity/concept, functions compose into larger operations.

### Loose Coupling, High Cohesion

**Coupling (Low is Good)**: Modules can change independently, easy to replace implementations, clear interfaces, minimal dependencies.

**Cohesion (High is Good)**: Related functionality grouped, single responsibility, easy to understand, easy to name.

**How**: Depend on abstractions, use message passing (not shared state), group related functionality together.

### Composition Over Inheritance

Build complex behavior by composing simple functions, not by inheriting from classes.

**Why**: More flexible, no fragile base class problem, easier to understand, better with TypeScript.

**How**: Build with small, focused functions that compose naturally.

### DRY (Don't Repeat Yourself)

Every piece of knowledge should have a single, authoritative representation.

**Rule of Three**: Wait for three uses before abstracting. First use: write it. Second use: duplicate (note similarity). Third use: abstract (pattern is clear).

**Why Wait**: Premature abstraction is hard to undo, wrong abstraction is worse than duplication, true patterns emerge over time.

### KISS (Keep It Simple, Stupid)

Favor simplicity over unnecessary complexity.

**Why**: Complexity makes code harder to understand, maintain, and modify. Simplicity reduces bugs and cognitive load.

**How**: Choose simple algorithms over clever ones, boring solutions over novel ones, explicit over implicit.

### YAGNI (You Ain't Gonna Need It)

Don't add functionality until it's actually required.

**Why**: Speculation adds complexity now, may never be needed, wrong when finally needed, makes current work harder.

**How**: Build only current requirements, known use cases, actual patterns.

## Examples

### Complete Example: Creating a User

```typescript
// 1. Repository Layer
export const create: FirestoreRepoFn<UserCreate, User> =
  (db, ctx, logger) => async (data) => {
    const id = randomUUID()
    const now = Timestamp.now()
    
    const user = userSchema.parse({
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
      createdBy: ctx.userId,
      updatedBy: ctx.userId,
    })
    
    await db.collection('users').doc(id).set(user)
    logger.debug({ user }, '[firestore] user created')
    
    return { ok: true, value: user }
  }

// 2. Command Layer
export const create: CommandFn<UserCreateRequest, User, Repo, null, null> =
  ({ repo }, ctx, logger) => async (data) => {
    logger.debug({ data }, '[cmd] create user')
    
    const result = await repo.createUser(data)
    
    if (!result.ok) {
      logger.error({ error: result.error }, '[cmd] error')
      return result
    }
    
    logger.debug({ user: result.value }, '[cmd] success')
    return { ok: true, value: result.value }
  }

// 3. HTTP Layer
app.post(
  '/',
  requireRole('platform'),
  zValidator('json', userCreateRequestSchema),
  async (c) => {
    const { createUser } = c.get('cmds')
    const result = await createUser(c.req.valid('json'))
    return resultToResponse(result, 201)(c)
  }
)
```

## Troubleshooting

### Common Issues

**Issue**: TypeScript errors about missing types
**Solution**: Ensure all function signatures use explicit type parameters

**Issue**: Errors not propagating correctly
**Solution**: Always return Result types unchanged, don't transform errors

**Issue**: Tests failing due to dependencies
**Solution**: Use factory functions—easy to mock by passing mock dependencies

**Issue**: Validation happening multiple times
**Solution**: Validate only at boundaries (HTTP, database, external services)

## See Also

- [Platform Structure](./01-platform.md) - How services are organized
- [Implementation Patterns](./02-patterns.md) - TypeScript and Hono patterns
- [Quality Standards](./03-quality.md) - Testing and code quality

