# Infrastructure Patterns

## Overview

This document covers CDKTF patterns, workspace structure, Docker image strategy, and CI/CD workflows for infrastructure provisioning and deployment.

## CDKTF Workspace Structure

Four workspaces mirror the GCP project architecture:

- `iac/projects`: Creates GCP projects, billing links, APIs
- `iac/infra`: Shared networking, IAM, Firestore, Identity Platform
- `iac/app`: Cloud Run services
- `iac/ingress`: API Gateway and ingress bindings

## App Stack Pattern

Extend `AppStack` to provision Cloud Run services:

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
      },
    })

    new TerraformOutput(this, 'api-service-uri', {
      value: this.apiService.service.uri,
    })
  }
}
```

## Remote State

Use `DataTerraformRemoteStateGcs` for cross-stack dependencies:

```typescript
this.remoteState = new DataTerraformRemoteStateGcs(this, 'id', {
  bucket: envConfig.bucket,
  prefix: this.remotePrefix('app', 'service-name'),
})

const serviceUri = this.remoteState.getString('api-service-uri')
```

## Ingress Stack Pattern

Extend `IngressStack` to expose Cloud Run services through API Gateway:

```typescript
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

Key points:
- Read service outputs from app stack remote state
- Create API Gateway with OpenAPI template
- Grant IAM permissions for API Gateway to invoke Cloud Run

## Docker Image Strategy

Services compile TypeScript before containerization:

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

## CI/CD Workflow

1. Quality gates (lint, test, build)
2. Change detection
3. Synth for changed workspaces
4. Diff for changed stacks
5. Build Docker images
6. Deploy stacks with new images

## GitHub Actions Workflow Generation

GitHub Actions workflow files are automatically generated/updated at the start of the PR phase to reflect all discovered IaC stacks. The `update_github_workflows` tool:

- Discovers all IaC workspaces (projects, infra, app, ingress) and their stacks
- Discovers all services and apps with corresponding IaC stacks
- Updates path filters in `detect-changes` jobs
- Updates matrix generation scripts for synth/diff/build/deploy
- Preserves existing workflow structure, environment variables, and secrets

Workflow changes must be committed before pushing the branch.

## See Also

- [Workflow Guide](./05-workflow.md) - Development workflow

