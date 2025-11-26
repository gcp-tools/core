# Implementation Patterns

> **PHASE:** implementation, architecture
> **PRIORITY:** REQUIRED

## Quick Reference

- [ ] TypeScript Standards: No any, types not interfaces, explicit return types, readonly, const assertions
- [ ] Function Signatures: FirestoreRepoFn, ServiceFn, CommandFn, FirebaseAuthFn
- [ ] Layer Patterns: Repository CRUD, Command orchestration, Service integration
- [ ] Validation: Four-level schema hierarchy, Zod validation at boundaries
- [ ] Hono Patterns: Route definition, middleware chain, resultToResponse

## REQUIRED Patterns

### TypeScript Standards

**When to use:** All TypeScript code

**Code Style:**
- 2-space indentation
- Maximum 80 characters per line
- Single quotes for strings
- Trailing commas in multi-line structures
- Semicolons only when necessary
- Arrow functions with parentheses for parameters

**Type Safety:**
```typescript
// Enable strict mode
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noImplicitReturns": true,
  "noFallthroughCasesInSwitch": true
}
```

**Rules:**
- MUST: Enable strict mode and all strict checks
- MUST NOT: Use the 'any' type
- MUST: Use explicit return types for functions
- MUST: Use types not interfaces
- MUST: Use readonly for immutable properties
- MUST: Use const assertions for literal types
- MUST: Use proper type imports/exports with ESM syntax
- SHOULD: Prefer functions over classes
- MUST: Use async/await for asynchronous operations
- MUST: Use zod 4 to parse all inputs

**Example:**
```typescript
// ✅ CORRECT
export const create: FirestoreRepoFn<Create, Full> =
  (db, ctx, logger) => async (data) => {
    return { ok: true, value: result }
  }

// ❌ INCORRECT
export const create = async (data: any): Promise<any> => {
  // No type safety
}
```

### Function Signatures

**When to use:** All IO functions

**Repository Function:**
```typescript
type FirestoreRepoFn<A, R> = (
  db: Firestore,
  ctx: RequestContext,
  logger: Logger,
) => (args: A) => Promise<Result<R>>
```

**Service Function:**
```typescript
type ServiceFn<A, R> = (
  ctx: RequestContext,
  logger: Logger,
) => (args: A) => Promise<R>
```

**Command Function:**
```typescript
type CommandFn<A, R, Re = null, Se = null, Au = null> = (
  deps: { repo: Re; services: Se; auth: Au },
  ctx: RequestContext,
  logger: Logger,
) => (args: A) => Promise<Result<R>>
```

**Firebase Auth Function:**
```typescript
type FirebaseAuthFn<A, R> = (
  auth: Auth,
  ctx: RequestContext,
  logger: Logger,
) => (args: A) => Promise<Result<R>>
```

**Rules:**
- MUST: Use exact function signatures for each layer
- MUST: Return Result<T> for repositories, commands, auth
- MUST: Return R (not Result) for services (wrapper adds Result)
- MUST: Use curried pattern (dependencies first, args second)
- MUST: Include explicit type parameters

### Repository Layer Patterns

**When to use:** All data access operations

**Create Pattern:**
```typescript
export const create: FirestoreRepoFn<Create, Full> =
  (db, ctx, logger) => async (data) => {
    const id = randomUUID()
    const now = Timestamp.now()
    const result = fullSchema.parse({
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
      createdBy: ctx.userId,
      updatedBy: ctx.userId,
    })
    await db.collection('entities').doc(id).set(result)
    return { ok: true, value: result }
  }
```

**Get-By-ID Pattern:**
```typescript
export const getById: FirestoreRepoFn<string, Full> =
  (db, ctx, logger) => async (id) => {
    const doc = await db.collection('entities').doc(id).get()
    if (!doc.exists) {
      return { ok: false, error: { code: 'NOT_FOUND', message: 'Not found' } }
    }
    const result = fullSchema.parse(doc.data())
    return { ok: true, value: result }
  }
```

**Update Pattern:**
```typescript
export const update: FirestoreRepoFn<Update, Full> =
  (db, ctx, logger) => async (data) => {
    const { id, ...updates } = data
    const now = Timestamp.now()
    const result = fullSchema.parse({
      ...existing,
      ...updates,
      updatedAt: now,
      updatedBy: ctx.userId,
    })
    await docRef.set(result)
    return { ok: true, value: result }
  }
```

**Rules:**
- MUST: Generate UUID for new documents
- MUST: Use Timestamp.now() for Firestore timestamps
- MUST: Validate with Zod before writing
- MUST: Add audit fields (createdAt, updatedAt, createdBy, updatedBy)
- MUST: Return Result<T> for all operations
- MUST: Return NOT_FOUND error when document doesn't exist

### Command Layer Patterns

**When to use:** All business logic orchestration

**Simple Command:**
```typescript
export const create: CommandFn<Request, Response, Repo, null, null> =
  ({ repo }, ctx, logger) => async (data) => {
    logger.debug({ data }, '[cmd] starting')
    const result = await repo.create(data)
    if (!result.ok) return result
    logger.debug({ value: result.value }, '[cmd] success')
    return { ok: true, value: result.value }
  }
```

**Multi-Step Command:**
```typescript
export const create: CommandFn<Request, Response, Repo, Services, null> =
  ({ repo, services }, ctx, logger) => async (data) => {
    const step1 = await repo.checkExists(data)
    if (!step1.ok) return step1
    
    const step2 = await services.createExternal(data)
    if (!step2.ok) return step2
    
    const step3 = await repo.create(data)
    return step3
  }
```

**Rules:**
- MUST: Log input at start
- MUST: Propagate errors by returning result unchanged
- MUST: Log success with result value
- MUST: Return Result<T> for all commands
- SHOULD: Handle multi-step operations sequentially
- MUST NOT: Mix business logic with data access
- MUST NOT: Re-validate input data that was already validated by `zValidator` in routes
- EXCEPTION: If specific validation is requested during the brief stage, additional validation may be added in the command layer (e.g., cross-field validation, business rule validation, validation requiring database lookups)
- MUST: Trust that `c.req.valid('json')` has already been validated at the HTTP boundary for basic schema validation

### Service Layer Patterns

**When to use:** Apps calling services (NOT for services calling services)

**Client Setup:**
```typescript
import type { AppType } from '@service/api/hc'
import { hc } from 'hono/client'

export const client = hc<AppType>(env.SERVICE_URL)
```

**Service Function:**
```typescript
type Request = InferRequestType<typeof client.endpoint.$post>['json']
type Response = InferResponseType<typeof client.endpoint.$post>

export const callService: ServiceFn<Request, Response> =
  (ctx, logger) => async (args) => {
    const response = await client.endpoint.$post({
      json: args,
      headers: {
        'x-correlation-id': ctx.correlationId,
        'x-apigateway-api-userinfo': Buffer.from(JSON.stringify({ claims: { user_id: ctx.userId } })).toString('base64url'),
      },
    })
    if (!response.ok) throw new Error(`Service returned ${response.status}`)
    return await response.json()
  }
```

**Rules:**
- MUST: Only apps use Service Layer patterns (services cannot call services)
- MUST: Use typed Hono client (hc<AppType>)
- MUST: Infer request/response types from client
- MUST: Forward correlation ID and user info headers
- MUST: Throw on HTTP errors (wrapper converts to Result)
- MUST NOT: Return Result<T> directly (wrapper adds it)
- MUST NOT: Services include `io/services/` directory

### Schema Hierarchy

**When to use:** All entity definitions

**Four Levels:**
```typescript
// 1. Full Schema (database)
const entitySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid(),
})
type Entity = z.infer<typeof entitySchema>

// 2. Create Schema (without generated fields)
const entityCreateSchema = entitySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
})

// 3. Request Schema (user-facing) - does not have to be the same - can be a subset of entityCreateSchema
const entityCreateRequestSchema = entityCreateSchema

// 4. Update Schema (partial with required id)
const entityUpdateRequestSchema = z.intersection(
  entitySchema.pick({ id: true }),
  entitySchema.omit({ id: true, createdAt: true, createdBy: true }).partial()
)
```

**Rules:**
- MUST: Define four-level schema hierarchy
- MUST: Infer types from schemas (z.infer)
- MUST: Use Full schema for database operations
- MUST: Use Create schema for new documents
- MUST: Use Update schema for partial updates
- MUST NOT: Duplicate type definitions

### Hono Route Patterns

**When to use:** All HTTP route definitions

**Route Definition:**
```typescript
const app = new Hono<{ Variables: AppContext & RepoContext & ServiceContext & CommandContext }>()

app.use(async (c, next) => {
  c.set('repoFns', repoFns)
  c.set('serviceFns', serviceFns)
  c.set('cmdFns', cmdFns)
  await next()
})

app.use(initFirestoreRepo())
app.use(initServices())
app.use(initCommands())

app.post('/', requireRole('platform'), zValidator('json', schema), async (c) => {
  const { create } = c.get('cmds')
  const result = await create(c.req.valid('json'))
  return resultToResponse(result, 201)(c)
})
```

**Rules:**
- MUST: Type app with all context types
- MUST: Set function refs before initialization
- MUST: Initialize in order: Repo → Services → Commands
- MUST: Use zValidator for request validation
- MUST: Use requireRole for authorization
- MUST: Use resultToResponse (curried function) for responses: `resultToResponse(result, status)(c)`
- MUST: Export as default

### Middleware Chain

**When to use:** Service and app entry points

**Service Middleware Order:**
```typescript
app.use(async (c, next) => {
  c.set('env', env)
  c.set('logger', logger)
  c.set('db', db)
  await next()
})

app.use(cors())
app.use(secureHeaders())
app.use(csrf())
app.use(errorHandler)
app.use(tenantContext)  // Services: extract TenantContext from headers
app.use(requestContextLogger)
```

**App Middleware Order:**
```typescript
app.use(async (c, next) => {
  c.set('env', env)
  c.set('logger', logger)
  c.set('db', db)
  await next()
})

app.use(cors())
app.use(secureHeaders())
app.use(csrf())
app.use(errorHandler)
app.use(context)  // Apps: extract RequestContext from JWT
app.use(requestContextLogger)
```

**Rules:**
- MUST: Set base context first
- MUST: Apply security middleware early
- MUST: Apply error handler before context extraction
- MUST: Services use `tenantContext` middleware (service-to-service calls)
- MUST: Apps use `context` middleware (user requests from API Gateway)
- MUST: Extract context before request logger
- MUST: Apply request logger before routes

### Context Types

**When to use:** Context extraction and usage

**Hierarchy:**
```typescript
type SimpleContext = {
  readonly correlationId: string
  readonly role: string
  readonly userId: string
}

type TenantContext = SimpleContext & {
  readonly tenantId: string
}

type RequestContext = TenantContext & {
  readonly organisationType: string
}
```

**Middleware Usage:**
- **Services**: Use `tenantContext` middleware → extracts `TenantContext` from headers (x-tenant-id, x-user-id, etc.)
- **Apps**: Use `context` middleware → extracts `RequestContext` from JWT (x-apigateway-api-userinfo)

**Rules:**
- MUST: Services use `tenantContext` middleware to extract TenantContext
- MUST: Apps use `context` middleware to extract RequestContext
- MUST: Use SimpleContext when no tenant isolation needed (use `simpleContext` middleware)
- MUST: Use readonly for all context properties
- MUST: Extract from headers via middleware (never access headers directly)

### Validation Boundaries

**When to use:** Understanding where validation occurs in the layered architecture

**Validation Flow:**
1. **HTTP Layer**: Validates incoming requests using `zValidator('json', requestSchema)` - handles schema validation, type checking, required fields
2. **Command Layer**: Receives validated data via `c.req.valid('json')` and uses it directly. Additional validation only if explicitly required by brief (e.g., business rules, cross-field validation, database-dependent checks)
3. **Repository Layer**: Validates data before writing to database using full schema

**Rules:**
- MUST: Validate at HTTP boundary using `zValidator` with request schema
- MUST: Commands trust that `c.req.valid('json')` has already been validated for basic schema compliance
- MUST NOT: Re-validate request schema in commands (duplicates HTTP validation)
- EXCEPTION: Additional validation in commands is allowed if explicitly required by brief (e.g., cross-field validation, business rules, database lookups)
- MUST: Repository validates with full schema before database writes
- MUST: Each layer validates only what it's responsible for

## REFERENCE Patterns

### Type Guards

**Pattern:**
```typescript
function isOk<T>(result: Result<T>): result is Ok<T> {
  return result.ok === true
}

if (isOk(result)) {
  // TypeScript knows result.value exists
}
```

### Utility Types

**Pattern:**
```typescript
type Request = InferRequestType<typeof client.endpoint.$post>['json']
type Response = InferResponseType<typeof client.endpoint.$post>
type Summary = Pick<Entity, 'id' | 'name'>
type WithoutAudit = Omit<Entity, 'createdAt' | 'updatedAt'>
```

### Discriminated Unions

**Pattern:**
```typescript
const userSchema = z.object({ class: z.literal('user'), role: z.string() })
const orgSchema = z.object({ class: z.literal('organisation'), type: z.string() })
const entitySchema = z.union([userSchema, orgSchema])

function handle(entity: Entity) {
  if (entity.class === 'user') {
    // TypeScript knows entity.role exists
  }
}
```

## Decision Trees

**Q: What function signature should I use?**

- Data access (Firestore) → FirestoreRepoFn<A, R>
- App calling service → ServiceFn<A, R> (apps only, not services)
- Business logic orchestration → CommandFn<A, R, Re, Se, Au>
- Firebase Auth operation → FirebaseAuthFn<A, R>

**Q: Can I use Service Layer in this component?**

- App component → ✅ Yes, apps can call services
- Service component → ❌ No, services cannot call other services

**Q: What schema should I use?**

- Database read/write → Full Schema
- Creating new document → Create Schema
- HTTP request validation → Request Schema
- Partial update → Update Schema

**Q: How do I handle errors?**

- Repository error → Return Result<T> with error
- Service error → Throw (wrapper converts to Result)
- Command error → Propagate Result<T> or create business error
- HTTP error → Use resultToResponse to convert Result to HTTP

**Q: What context type and middleware should I use?**

- Service component → Use `tenantContext` middleware → TenantContext
- App component → Use `context` middleware → RequestContext
- No tenant isolation needed → Use `simpleContext` middleware → SimpleContext

