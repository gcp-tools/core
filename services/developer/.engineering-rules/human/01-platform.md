# Platform Structure

## Overview

This document explains the GCP project architecture and service structure used across the platform. Understanding this structure is essential for planning infrastructure and organizing service code.

## Apps vs Services

The platform distinguishes between **apps** and **services**, though both are built using the same gcp-tools-hono patterns.

### Definitions

- **Apps**: User-facing applications that orchestrate business workflows. Apps can call services to fulfill user requests.
- **Services**: Backend services that provide specific domain capabilities. Services are called by apps but cannot call other services.

### Communication Rules

- ✅ **Apps → Services**: Allowed (apps can call services via Service Layer)
- ❌ **Services → Services**: NOT ALLOWED (services cannot call other services)
- ✅ **Both built the same way**: Apps and services use identical structure (gcp-tools-hono patterns)

### Examples

- **App**: Management API (orchestrates workflows, calls identity service, config service)
- **Service**: Identity Service (manages users, called by apps)
- **Service**: Config Service (manages configuration, called by apps)

### Key Differences

- **Apps** include `io/services/` directory for calling other services
- **Services** omit `io/services/` directory and export `hc.mts` for apps to consume
- **Apps** also export `hc.mts` for UIs to consume (UI rules will be added later)
- Both follow the same directory structure, patterns, and conventions

## GCP Project Structure

The platform uses a three-project architecture:

- **Host Project**: Shared VPC, API Gateway, Load Balancers, Ingress
- **Data Project**: Cloud SQL, Firestore, BigQuery, Database IAM
- **App Project**: Cloud Run services, Pub/Sub, Cloud Functions

**Why**: Security isolation, granular IAM boundaries, cost tracking, compliance.

## Service Directory Structure

Every app and service follows this exact structure (both use the same layout):

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
│   ├── hc.mts           # Hono client export (services for apps, apps for UIs)
│   └── index.mts         # Main entry point
└── tests/
    ├── helpers/          # Test utilities
    ├── integration/      # Integration tests
    └── unit/            # Unit tests
```

**Note**: 
- The `io/services/` directory is only present in apps. Services omit this directory since they cannot call other services.
- Both apps and services must export `hc.mts` (services for apps to consume, apps for UIs to consume).

## Service Setup Configuration

Every service requires a standard set of configuration files for TypeScript compilation, linting, testing, and containerization. These files ensure consistency across the platform and enable proper tooling integration.

### Required Configuration Files

1. **package.json** - Defines dependencies, scripts, and Node.js version requirements
2. **tsconfig.json** / **tsconfig.base.json** / **tsconfig.test.json** - TypeScript compiler configuration
3. **biome.json** - Code formatting and linting rules
4. **vitest.config.mts** / **vitest.config.unit.mts** / **vitest.config.integration.mts** - Test runner configuration
5. **Dockerfile** - Container build instructions
6. **turbo.json** - Workspace-level build orchestration (configured at workspace root)

### Package.json

The `package.json` must include all required scripts and specify the Node.js version:

```json
{
  "name": "@namespace/service-name",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.mjs",
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

**Key Points:**
- Use `type: "module"` for ESM support
- All scripts must be present for Turbo integration
- Node.js version must be >=22.0.0

### TypeScript Configuration

TypeScript uses a three-file configuration pattern:

**tsconfig.base.json** - Base configuration shared by all projects:
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

**tsconfig.json** - Main source compilation:
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

**tsconfig.test.json** - Test compilation:
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

**Rationale:**
- Composite projects enable incremental builds and project references
- Separate test config allows different type checking for tests
- Strict mode ensures type safety

### Biome Configuration

Biome handles both formatting and linting:

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

**Key Settings:**
- 2-space indentation
- 80 character line width
- Single quotes for strings
- Trailing commas in multi-line structures
- Organize imports automatically

### Vitest Configuration

Three separate Vitest configurations are required:

**vitest.config.mts** - Main configuration (for combined test runs):
```typescript
import { defineConfig } from 'vitest/config'

// Set environment variables before any modules are imported
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

**vitest.config.unit.mts** - Unit test configuration:
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

**vitest.config.integration.mts** - Integration test configuration:
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

**Key Differences:**
- Unit tests: 100% coverage threshold, 5s timeout, tests commands and services
- Integration tests: 80% coverage threshold, 10s timeout, tests routes and repositories
- Separate coverage directories for unit and integration reports

### Dockerfile

Container builds use a multi-stage pattern optimized for workspace monorepos:

```dockerfile
FROM node:22-alpine

WORKDIR /workspace

ENV NODE_ENV=production

# Copy root workspace files (from local filesystem)
COPY package.json package-lock.json .npmrc ./

# Copy root node_modules (from local npm ci installation)
COPY node_modules ./node_modules

# Copy service directory with pre-built dist (from artifacts) and service node_modules (from local npm ci)
COPY services/[service-name] ./services/[service-name]

# Prune dev dependencies (requires workspace structure)
RUN npm prune --workspace=services/[service-name] --omit=dev

# Set working directory to service location for runtime
WORKDIR /workspace/services/[service-name]

USER node

EXPOSE 8080

CMD ["node", "dist/index.mjs"]
```

**Key Points:**
- Uses Node.js 22 Alpine for smaller image size
- Assumes pre-built artifacts (dist/) from CI
- Workspace-aware dependency pruning
- Runs as non-root user for security

### Turbo Configuration

Turbo configuration is managed at the workspace root level. Each service must ensure its tasks align with the workspace `turbo.json`:

**Required Tasks:**
- `build` - dependsOn: ["^build"], outputs: ["dist/**"]
- `check-types` - dependsOn: ["^check-types"]
- `lint` - inputs: ["src/**/*.mts", "biome.json"]
- `test` / `test:unit` / `test:integration` - dependsOn: ["build"], outputs: ["coverage/**"]

**Benefits:**
- Incremental builds (only rebuilds what changed)
- Parallel execution across services
- Caching for faster CI/CD

## File Naming

- Files: `kebab-case.mts`
- Exports: `camelCase`
- Types: `PascalCase`
- Constants: `SCREAMING_SNAKE_CASE`

## Environment Configuration

Use Zod for environment validation:

```typescript
const envSchema = z.object({
  SERVICE_NAME: z.string().default('service-name'),
  FIRESTORE_PROJECT_ID: z.string(),
  NODE_ENV: z.union([z.literal('dev'), z.literal('prod')]).default('dev'),
})

export const loadEnv = (): Env => envSchema.parse(process.env)
```

## Service Entry Point

The `index.mts` file initializes services:

1. Load and validate environment
2. Create logger and database
3. Set up Hono app with middleware
4. Use `tenantContext` middleware (services receive calls from apps via headers)
5. Mount routes
6. Start server (conditionally)

**Key Point**: Services use `tenantContext` middleware to extract `TenantContext` from headers (x-tenant-id, x-user-id, etc.)

## App Entry Point

The `index.mts` file initializes apps:

1. Load and validate environment
2. Create logger and database
3. Set up Hono app with middleware
4. Use `context` middleware (apps receive user requests from API Gateway with JWT)
5. Mount routes
6. Start server (conditionally)

**Key Point**: Apps use `context` middleware to extract `RequestContext` from JWT (x-apigateway-api-userinfo)

## See Also

- [Core Principles](./00-principles.md) - Design principles
- [Implementation Patterns](./02-patterns.md) - Code patterns

