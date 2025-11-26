# Infrastructure Patterns

> **PHASE:** infrastructure, pr, merge
> **PRIORITY:** REQUIRED

## Quick Reference

- [ ] CDKTF Workspaces: projects, infra, app, ingress
- [ ] App Stack Pattern: Extend AppStack, define Cloud Run service, export outputs
- [ ] Ingress Stack Pattern: Extend IngressStack, create API Gateway, grant IAM permissions
- [ ] Remote State: Use DataTerraformRemoteStateGcs for cross-stack dependencies
- [ ] Docker: Node 22 Alpine, pre-built dist, npm prune
- [ ] CI/CD: Change detection, matrices, synth/diff/deploy workflows

## REQUIRED Patterns

### CDKTF Workspace Structure

**When to use:** All infrastructure provisioning

**Workspaces:**
- `iac/projects`: Creates GCP projects, billing links, APIs
- `iac/infra`: Shared networking, IAM, Firestore, Identity Platform
- `iac/app`: Cloud Run services
- `iac/ingress`: API Gateway and ingress bindings

**Rules:**
- MUST: Use separate workspace for each project type
- MUST: Follow workspace naming convention
- MUST: Use shared configuration via @gcp-tools/cdktf/utils

### App Stack Pattern

**When to use:** All Cloud Run service provisioning

**Pattern:**
```typescript
export class ServiceStack extends AppStack {
  public readonly apiService: cloudrun.CloudRunServiceConstruct

  constructor(scope: App) {
    super(scope, 'service-name', {
      databases: ['firestore'],
    })

    this.apiService = new cloudrun.CloudRunServiceConstruct(this, 'api', {
      region: envConfig.regions[0],
      serviceConfig: {
        environmentVariables: {
          FIRESTORE_PROJECT_ID: this.firestoreDatabaseProjectId,
          NODE_ENV: 'production',
        },
        egress: 'PRIVATE_RANGES_ONLY',
      },
    })

    new TerraformOutput(this, 'api-service-uri', {
      value: this.apiService.service.uri,
    })
  }
}
```

**Rules:**
- MUST: Extend AppStack base class
- MUST: Define Cloud Run service via CloudRunServiceConstruct
- MUST: Export service outputs (uri, name, location, project)
- MUST: Set environment variables from stack properties
- MUST: Use envConfig.regions[0] for region

### Remote State Pattern

**When to use:** Cross-stack dependencies

**Pattern:**
```typescript
this.remoteState = new DataTerraformRemoteStateGcs(this, 'id', {
  bucket: envConfig.bucket,
  prefix: this.remotePrefix('app', 'service-name'),
})

const serviceUri = this.remoteState.getString('api-service-uri')
```

**Rules:**
- MUST: Use DataTerraformRemoteStateGcs for remote state
- MUST: Use remotePrefix() for consistent prefixes
- MUST: Read outputs as strings via getString()
- MUST: Grant IAM permissions for dependent services

### Ingress Stack Pattern

**When to use:** Exposing Cloud Run services through API Gateway

**Pattern:**
```typescript
import { join } from 'node:path'
import { cloudRunIam } from '@cdktf/provider-google'
import { apigateway } from '@gcp-tools/cdktf/constructs'
import { IngressStack } from '@gcp-tools/cdktf/stacks/ingress'
import { envConfig } from '@gcp-tools/cdktf/utils'
import { DataTerraformRemoteStateGcs } from '@cdktf/remote-backend-gcs'
import { type App } from 'cdktf'

export class ServiceIngressStack extends IngressStack {
  constructor(scope: App) {
    super(scope, 'service-name')

    // Read remote state from app stacks
    this.appRemoteState = new DataTerraformRemoteStateGcs(this, 'app-remote-state', {
      bucket: envConfig.bucket,
      prefix: this.remotePrefix('app', 'service-name'),
    })

    const apiServiceUri = this.appRemoteState.getString('api-service-uri')
    const apiServiceName = this.appRemoteState.getString('api-service-name')
    const apiServiceLocation = this.appRemoteState.getString('api-service-location')
    const apiServiceProject = this.appRemoteState.getString('api-service-project')

    // Create API Gateway
    this.apiGateway = new apigateway.ApiGatewayConstruct(this, 'api-gateway', {
      region: envConfig.regions[0],
      displayName: 'service-api-gateway',
      openApiTemplatePath: join(process.cwd(), '..', 'api-gateway-config/service.yaml.tpl'),
      cloudRunServices: [
        {
          key: 'SERVICE_URI',
          name: apiServiceName,
          uri: apiServiceUri,
        },
      ],
      templateVars: {
        FIREBASE_PROJECT_ID: firebaseProjectId,
      },
    })

    // Grant API Gateway service account permission to invoke Cloud Run
    new cloudRunIam.CloudRunServiceIamMember(this, 'sa-invoker', {
      service: apiServiceName,
      location: apiServiceLocation,
      project: apiServiceProject,
      role: 'roles/run.invoker',
      member: `serviceAccount:${this.stackServiceAccount.email}`,
      provider: this.googleProvider,
    })
  }
}
```

**Rules:**
- MUST: Extend IngressStack base class from @gcp-tools/cdktf/stacks/ingress
- MUST: Read remote state from app stacks to get service URIs, name, location, project
- MUST: Use ApiGatewayConstruct for API Gateway creation
- MUST: Grant `roles/run.invoker` to API Gateway service account via CloudRunServiceIamMember
- MUST: Use remotePrefix() for consistent state prefixes
- MUST: Reference OpenAPI template file for API Gateway config

### Docker Image Pattern

**When to use:** All service containerization

**Pattern:**
```dockerfile
FROM node:22-alpine
WORKDIR /workspace
ENV NODE_ENV=production
COPY package.json package-lock.json .npmrc ./
COPY node_modules ./node_modules
COPY services/service/api ./services/service/api
RUN npm prune --workspace=services/service/api --omit=dev
WORKDIR /workspace/services/service/api
USER node
EXPOSE 8080
CMD ["node", "dist/index.mjs"]
```

**Rules:**
- MUST: Use node:22-alpine base image
- MUST: Build dist/ before docker build
- MUST: Use npm prune to remove dev dependencies
- MUST: Use non-root node user
- MUST: Expose port 8080
- MUST: Run node dist/index.mjs

### CI/CD Workflow

**When to use:** All deployments

**Workflow Steps:**
1. Setup: Authenticate via Workload Identity Federation
2. Quality: lint, test, build
3. Change Detection: Identify changed workspaces/stacks
4. Synth: Run cdktf synth for changed workspaces
5. Diff: Run cdktf diff for changed stacks
6. Build: Build Docker images for changed services
7. Deploy: Run cdktf deploy for changed stacks

**Rules:**
- MUST: Run quality gates before deployment
- MUST: Use change detection to skip unchanged components
- MUST: Use matrices for parallel execution
- MUST: Collect image URIs for deployment
- MUST: Deploy in order: projects → infra → app → ingress

## REFERENCE Patterns

### Environment Variables

**Runtime Variables:**
- FIRESTORE_PROJECT_ID: Set by AppStack
- NODE_ENV: Hard-coded 'production'
- SERVICE_URL: From remote state
- SERVICE_API_KEY: From remote state

**Rules:**
- SHOULD: Pull service URLs from remote state
- SHOULD: Pull API keys from remote state
- MUST: Set NODE_ENV to production

### CDKTF Commands

**Local:**
```bash
npm run synth --workspace iac/app
npm run diff --workspace iac/app --stack=service
STACK=service npm run deploy --workspace iac/app
```

**Rules:**
- SHOULD: Run synth before diff
- SHOULD: Run diff before deploy

### GitHub Actions Workflow Generation

**When to use:** At the start of PR phase (before push)

**Purpose:** Automatically generate/update GitHub Actions workflow files to reflect all discovered IaC stacks

**Workflow Files:**
- `.github/workflows/ci.yml` - PR CI workflow
- `.github/workflows/deploy.yml` - Deployment workflow

**Process:**
1. Discover all IaC workspaces and stacks
2. Discover all services and apps with corresponding IaC stacks
3. Generate path filters for change detection
4. Generate matrix generation scripts for synth/diff/build/deploy
5. Update workflow files to include all discovered stacks

**Rules:**
- MUST: Run `update_github_workflows` at the start of PR phase (before push)
- MUST: Commit workflow changes if they were updated (before push)
- MUST: Preserve existing workflow structure, environment variables, and secrets
- MUST: Update path filters to include all discovered stacks
- MUST: Update matrix generation to include all services/apps with IaC stacks
- Workflows are auto-generated from IaC discovery
- Path filters automatically include all discovered stacks
- Matrix generation includes all services/apps with IaC stacks
- MUST: Specify stack for diff/deploy

## Decision Trees

**Q: What workspace should this resource go in?**

- GCP project creation → iac/projects
- Shared infrastructure → iac/infra
- Cloud Run service → iac/app
- API Gateway → iac/ingress

**Q: How do I reference another service?**

- Read remote state → Use DataTerraformRemoteStateGcs
- Get service URI → remoteState.getString('api-service-uri')
- Grant invocation → Use cloudRunServiceIamMember

**Q: How do I expose a service through API Gateway?**

- Create ingress stack → Extend IngressStack
- Read app remote state → Get service URI, name, location, project
- Create ApiGatewayConstruct → Reference OpenAPI template
- Grant IAM permissions → CloudRunServiceIamMember with roles/run.invoker

