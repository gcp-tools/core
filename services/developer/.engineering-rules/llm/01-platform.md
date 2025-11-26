# Platform Structure

> **PHASE:** specification, architecture, implementation
> **PRIORITY:** REQUIRED

## Quick Reference

- [ ] Apps vs Services: Apps can call services; services cannot call services
- [ ] GCP Structure: Host → Data → App projects
- [ ] Service Structure: HTTP → Command → Repository/Service layers
- [ ] File Naming: kebab-case files, camelCase exports, PascalCase types
- [ ] Environment: Zod validation in env.mts
- [ ] Entry Point: index.mts with middleware chain
- [ ] Routes: Feature modules with initialization middleware

## REQUIRED Patterns

### Apps vs Services

**When to use:** Architecture planning and service design

**Definitions:**
- **Apps**: User-facing applications that orchestrate business workflows. Apps can call services to fulfill user requests.
- **Services**: Backend services that provide specific domain capabilities. Services are called by apps but cannot call other services.

**Communication Rules:**
- Apps → Services: ✅ Allowed (apps can call services via Service Layer)
- Services → Services: ❌ NOT ALLOWED (services cannot call other services)
- Both built the same way: Apps and services use identical structure (gcp-tools-hono patterns)

**Examples:**
- **App**: Management API (orchestrates workflows, calls identity service, config service)
- **Service**: Identity Service (manages users, called by apps)
- **Service**: Config Service (manages configuration, called by apps)

**Rules:**
- MUST: Build apps and services using the same gcp-tools-hono patterns
- MUST: Apps can use Service Layer (`io/services/`) to call services
- MUST NOT: Services include `io/services/` directory (services don't call other services)
- MUST: Services export `AppType` and `hc` from `hc.mts` for apps to consume
- MUST: Apps export `AppType` and `hc` from `hc.mts` for UIs to consume
- MUST: Identify component type (app vs service) during architecture phase

### GCP Project Structure

**When to use:** All infrastructure planning

**Structure:**
```
HOST PROJECT → DATA PROJECT → APP PROJECT
```

**Project Responsibilities:**
- Host: Shared VPC, API Gateway, Load Balancers, Ingress
- Data: Cloud SQL, Firestore, BigQuery, Database IAM
- App: Cloud Run, Pub/Sub, Cloud Functions, Application resources

**Rules:**
- MUST: Separate projects for security and IAM boundaries
- MUST: Host project manages networking
- MUST: Data project isolates database resources
- MUST: App project contains application services

### Service Directory Structure

**When to use:** All app and service creation (both use same structure)

**Layout:**
```
services/[service-name]/
├── src/
│   ├── commands/          # Business logic
│   ├── io/
│   │   ├── repo/         # Firestore repositories
│   │   ├── services/     # External service clients (apps only, not services)
│   │   └── auth/         # Firebase Auth (optional)
│   ├── routes/           # HTTP routes
│   ├── schemas/          # Zod schemas
│   ├── env.mts          # Environment config
│   └── index.mts         # Main entry point
└── tests/
    ├── helpers/          # Test utilities
    ├── integration/      # Integration tests
    └── unit/            # Unit tests
```

**Rules:**
- MUST: Follow exact directory structure
- MUST: Separate commands, io, routes, schemas
- MUST: Use tests/helpers for test utilities
- MUST: Separate unit and integration tests

### Service Setup Configuration

**When to use:** Creating new services or apps

**Required Files:**
- `package.json` - Dependencies and scripts
- `tsconfig.json` / `tsconfig.base.json` / `tsconfig.test.json` - TypeScript config
- `biome.json` - Linting and formatting
- `vitest.config.mts` / `vitest.config.unit.mts` / `vitest.config.integration.mts` - Test config
- `Dockerfile` - Container build
- Workspace `turbo.json` - Build orchestration (workspace-level)

**Package.json Scripts:**
```json
{
  "scripts": {
    "build": "tsc --pretty",
    "check-types": "tsc --build tsconfig.json tsconfig.test.json",
    "dev": "tsx watch src/index.mts",
    "lint": "biome check src --write --unsafe && npm run check-types",
    "start": "node dist/index.mjs",
    "test": "npm run test:unit && npm run test:integration",
    "test:unit": "vitest run --passWithNoTests tests/unit --config vitest.config.unit.mts",
    "test:integration": "vitest run --passWithNoTests tests/integration",
    "test:coverage": "npm run test:coverage:unit && npm run test:coverage:integration",
    "test:coverage:unit": "vitest run --config vitest.config.unit.mts --coverage tests/unit",
    "test:coverage:integration": "vitest run --config vitest.config.integration.mts --coverage tests/integration"
  },
  "engines": {
    "node": ">=22.0.0"
  }
}
```

**TypeScript Configuration:**

`tsconfig.base.json`:
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "NodeNext",
    "lib": ["ESNext"],
    "moduleResolution": "NodeNext",
    "moduleDetection": "force",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "allowSyntheticDefaultImports": true
  }
}
```

`tsconfig.json`:
```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "composite": true,
    "types": ["node"]
  },
  "include": ["src/**/*.mts", "src/**/*.ts"],
  "exclude": ["src/**/*.test.mts", "src/**/*.test.ts"]
}
```

`tsconfig.test.json`:
```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "rootDir": ".",
    "noEmit": true,
    "composite": true,
    "types": ["node", "vitest/globals"]
  },
  "references": [{ "path": "./tsconfig.json" }],
  "include": ["tests/**/*.mts", "tests/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Biome Configuration:**
```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.1/schema.json",
  "formatter": {
    "enabled": true,
    "formatWithErrors": false,
    "attributePosition": "auto",
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 80,
    "lineEnding": "lf"
  },
  "javascript": {
    "formatter": {
      "arrowParentheses": "always",
      "bracketSameLine": false,
      "bracketSpacing": true,
      "jsxQuoteStyle": "double",
      "quoteProperties": "asNeeded",
      "quoteStyle": "single",
      "semicolons": "asNeeded",
      "trailingCommas": "all"
    }
  },
  "json": {
    "formatter": {
      "trailingCommas": "none"
    }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "assist": {
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  }
}
```

**Vitest Configuration:**

`vitest.config.mts` (main):
```typescript
import { defineConfig } from 'vitest/config'

process.env.NODE_ENV = 'dev'
process.env.PORT = process.env.PORT || '8080'
process.env.SERVICE_NAME = process.env.SERVICE_NAME || 'service-name-test'
process.env.PROJECT_ID = process.env.FIRESTORE_PROJECT_ID || 'test-project'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.mts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.mts'],
      exclude: ['node_modules/', 'dist/', 'tests/', '**/*.d.ts', '**/*.config.*', 'src/index.mts', 'src/hc.mts'],
      all: true,
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
})
```

`vitest.config.unit.mts`:
```typescript
import { defineConfig } from 'vitest/config'

process.env.FIRESTORE_PROJECT_ID = process.env.FIRESTORE_PROJECT_ID || 'test-project'
process.env.NODE_ENV = 'dev'
process.env.PORT = process.env.PORT || '8080'
process.env.SERVICE_NAME = process.env.SERVICE_NAME || 'service-name-test'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 5000,
    pool: 'forks',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage/unit',
      include: ['src/commands/**/*.mts', 'src/io/services/**/*.mts'],
      exclude: ['node_modules/', 'dist/', 'tests/', '**/*.d.ts', '**/*.config.*', '**/index.mts'],
      all: true,
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
})
```

`vitest.config.integration.mts`:
```typescript
import { defineConfig } from 'vitest/config'

process.env.NODE_ENV = 'dev'
process.env.PORT = process.env.PORT || '8080'
process.env.SERVICE_NAME = process.env.SERVICE_NAME || 'service-name-test'
process.env.PROJECT_ID = process.env.FIRESTORE_PROJECT_ID || 'test-project'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.mts'],
    testTimeout: 10000,
    pool: 'forks',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage/integration',
      include: ['src/routes/**/*.mts', 'src/io/repo/**/*.mts'],
      exclude: ['node_modules/', 'dist/', 'tests/', '**/*.d.ts', '**/*.config.*', '**/index.mts'],
      all: true,
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
})
```

**Dockerfile Pattern:**
```dockerfile
FROM node:22-alpine

WORKDIR /workspace

ENV NODE_ENV=production

COPY package.json package-lock.json .npmrc ./
COPY node_modules ./node_modules
COPY services/[service-name] ./services/[service-name]

RUN npm prune --workspace=services/[service-name] --omit=dev

WORKDIR /workspace/services/[service-name]

USER node

EXPOSE 8080

CMD ["node", "dist/index.mjs"]
```

**Turbo Configuration:**
Workspace-level `turbo.json` must include tasks:
- `build` - dependsOn: ["^build"], outputs: ["dist/**"]
- `check-types` - dependsOn: ["^check-types"]
- `lint` - inputs: ["src/**/*.mts", "biome.json"]
- `test` / `test:unit` / `test:integration` - dependsOn: ["build"], outputs: ["coverage/**"]

**Rules:**
- MUST: Include all required scripts in package.json
- MUST: Use Node.js >=22.0.0 (engines field)
- MUST: Use TypeScript composite projects (tsconfig.json, tsconfig.test.json)
- MUST: Use strict mode and all strict checks
- MUST: Configure Biome with 2-space indent, 80 char width, single quotes
- MUST: Use separate vitest configs for unit and integration tests
- MUST: Achieve 100% coverage for unit tests, 80% for integration
- MUST: Include Dockerfile for container builds
- MUST: Configure Turbo tasks for build, lint, test

### File Naming Conventions

**When to use:** All file creation

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
- MUST NOT: Use uppercase in file names
- MUST NOT: Use snake_case for files

### Environment Configuration

**When to use:** All services

**Pattern:**
```typescript
const envSchema = z.object({
  SERVICE_NAME: z.string().default('service-name'),
  FIRESTORE_PROJECT_ID: z.string(),
  NODE_ENV: z.union([z.literal('dev'), z.literal('prod')]).default('dev'),
  PORT: z.coerce.number().default(8080),
})

export type Env = z.infer<typeof envSchema>
export const loadEnv = (): Env => envSchema.parse(process.env)
```

**Rules:**
- MUST: Use Zod for environment validation
- MUST: Export Env type
- MUST: Provide sensible defaults
- MUST: Fail fast if required vars missing
- MUST NOT: Access process.env directly

### Service Entry Point

**When to use:** All services

**Pattern:**
```typescript
import { tenantContext, requestContextLogger } from '@gcp-tools/hono'

const env = loadEnv()
const logger = createLogger(env.SERVICE_NAME)
const db = createFirestore(env.FIRESTORE_PROJECT_ID)

const app = new Hono<{ Variables: AppContext }>()

app.get('/health', (c) => c.json({ status: 'ok' }))

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
app.use(tenantContext)  // Services use tenantContext middleware
app.use(requestContextLogger)

app.route('/feature', featureRoutes)

if (import.meta.url === `file://${process.argv[1]}`) {
  serve({ fetch: app.fetch, port: env.PORT })
}
```

**Rules:**
- MUST: Load environment first
- MUST: Create logger and db early
- MUST: Health check before middleware
- MUST: Set base context before routes
- MUST: Use `tenantContext` middleware (services receive calls from apps via headers)
- MUST: Apply middleware in correct order
- MUST: Conditional server start (not in tests)
- MUST NOT: Start server in test environment

### App Entry Point

**When to use:** All apps

**Pattern:**
```typescript
import { context, requestContextLogger } from '@gcp-tools/hono'

const env = loadEnv()
const logger = createLogger(env.SERVICE_NAME)
const db = createFirestore(env.FIRESTORE_PROJECT_ID)

const app = new Hono<{ Variables: AppContext }>()

app.get('/health', (c) => c.json({ status: 'ok' }))

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
app.use(context)  // Apps use requestContext middleware (extracts from JWT)
app.use(requestContextLogger)

app.route('/feature', featureRoutes)

if (import.meta.url === `file://${process.argv[1]}`) {
  serve({ fetch: app.fetch, port: env.PORT })
}
```

**Rules:**
- MUST: Load environment first
- MUST: Create logger and db early
- MUST: Health check before middleware
- MUST: Set base context before routes
- MUST: Use `context` middleware (apps receive user requests from API Gateway with JWT)
- MUST: Apply middleware in correct order
- MUST: Conditional server start (not in tests)
- MUST NOT: Start server in test environment

### Route Module Pattern

**When to use:** All route definitions

**Pattern:**
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

export default app
```

**Rules:**
- MUST: Type app with all context types
- MUST: Set function refs before initialization
- MUST: Initialize in order: Repo → Services → Commands
- MUST: Use zValidator for request validation
- MUST: Use requireRole for authorization
- MUST: Use resultToResponse (curried function) for responses: `resultToResponse(result, status)(c)`
- MUST: Export as default

### Layered Architecture

**When to use:** All service implementation

**Layer Flow:**
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
- MUST: HTTP depends on Commands, not Repositories
- MUST: Commands depend on Repositories/Services, not HTTP
- MUST NOT: Mix concerns across layers
- MUST: Each layer has one responsibility

## REFERENCE Patterns

### Module Organization

**Command Module:**
```typescript
export { create as createApplication } from './create.mjs'
export { get as getApplication } from './get.mjs'

export type Commands = {
  createApplication: WrappedCommandFn<typeof createApplication>
  getApplication: WrappedCommandFn<typeof getApplication>
}
```

**Repository Module:**
```typescript
export { create as createApplication } from './create.mjs'
export { getById as getApplicationById } from './get-by-id.mts'

export type Repo = {
  createApplication: WrappedFirestoreRepoFn<typeof createApplication>
  getApplicationById: WrappedFirestoreRepoFn<typeof getApplicationById>
}
```

**Service Module:**
```typescript
export { createOrganisation } from './organisation-create.mjs'

export type Services = {
  createOrganisation: WrappedServiceFn<typeof createOrganisation>
}
```

### Hono Client Export

**When to use:** All services and apps must export this for consumers

**Pattern:**
```typescript
import type app from './index.mjs'
export type AppType = typeof app
export { hc }
```

**Rules:**
- MUST: All services export AppType and hc for apps to consume
- MUST: All apps export AppType and hc for UIs to consume
- MUST: Apps use service exports to create typed clients for calling services
- MUST: UIs use app exports to create typed clients for calling apps
- MUST NOT: Services use this pattern to call other services (services cannot call services)

## Decision Trees

**Q: What project should this resource go in?**

- Networking/ingress → Host Project
- Database/storage → Data Project
- Application service → App Project

**Q: What layer should this code go in?**

- HTTP concerns (routing, parsing) → HTTP Layer
- Business logic → Command Layer
- Data access → Repository Layer
- External APIs → Service Layer

**Q: How do I structure a new service or app?**

- Create directory structure → Follow service layout (same for apps and services)
- Define environment → Use Zod schema in env.mts
- Create entry point → Follow index.mts pattern
- Create routes → Follow route module pattern
- Implement layers → Commands → Repositories/Services
- If app → Include `io/services/` for calling services
- If service → Omit `io/services/`, export `hc.mts` for apps to consume

**Q: Is this an app or a service?**

- User-facing, orchestrates workflows, calls other services → App
- Provides specific domain capability, called by apps → Service
- If unsure → Ask: "Does this need to call other services?" → Yes = App, No = Service

