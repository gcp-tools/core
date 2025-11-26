import { existsSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

export type IacInventory = {
  readonly workspaces: {
    readonly projects: boolean
    readonly infra: boolean
    readonly app: { readonly stacks: readonly string[] }
    readonly ingress: { readonly stacks: readonly string[] }
  }
  readonly services: ReadonlyArray<{
    readonly name: string
    readonly stackPath: string
    readonly servicePath: string
  }>
  readonly apps: ReadonlyArray<{
    readonly name: string
    readonly stackPath: string
    readonly appPath: string
  }>
}

const isDirectory = (path: string): boolean => {
  try {
    return statSync(path).isDirectory()
  } catch {
    return false
  }
}

export const discoverIacWorkspaces = (
  projectRoot: string,
): {
  readonly projects: boolean
  readonly infra: boolean
  readonly app: boolean
  readonly ingress: boolean
} => {
  const iacDir = resolve(projectRoot, 'iac')
  if (!existsSync(iacDir)) {
    return {
      projects: false,
      infra: false,
      app: false,
      ingress: false,
    }
  }

  return {
    projects: isDirectory(join(iacDir, 'projects')),
    infra: isDirectory(join(iacDir, 'infra')),
    app: isDirectory(join(iacDir, 'app')),
    ingress: isDirectory(join(iacDir, 'ingress')),
  }
}

export const discoverAppStacks = (projectRoot: string): readonly string[] => {
  const stacksDir = resolve(projectRoot, 'iac/app/src/stacks')
  if (!existsSync(stacksDir)) {
    return []
  }

  return readdirSync(stacksDir)
    .filter((item) => {
      const itemPath = join(stacksDir, item)
      return isDirectory(itemPath)
    })
    .sort()
}

export const discoverIngressStacks = (
  projectRoot: string,
): readonly string[] => {
  const stacksDir = resolve(projectRoot, 'iac/ingress/src/stacks')
  if (!existsSync(stacksDir)) {
    return []
  }

  return readdirSync(stacksDir)
    .filter((item) => {
      const itemPath = join(stacksDir, item)
      return isDirectory(itemPath)
    })
    .sort()
}

export const discoverInfraStacks = (projectRoot: string): readonly string[] => {
  // Infra stacks are typically hardcoded: network, iam, firestore, identity-platform, artifact-registry
  // We could scan the main.mts file, but for now return the standard set
  const infraDir = resolve(projectRoot, 'iac/infra')
  if (!existsSync(infraDir)) {
    return []
  }

  // Standard infra stacks
  return [
    'network',
    'iam',
    'firestore',
    'identity-platform',
    'artifact-registry',
  ]
}

export const discoverServices = (
  projectRoot: string,
): ReadonlyArray<{
  readonly name: string
  readonly stackPath: string
  readonly servicePath: string
}> => {
  const servicesDir = resolve(projectRoot, 'services')
  if (!existsSync(servicesDir)) {
    return []
  }

  const services: Array<{
    readonly name: string
    readonly stackPath: string
    readonly servicePath: string
  }> = []

  for (const serviceName of readdirSync(servicesDir)) {
    const servicePath = join(servicesDir, serviceName)
    if (!isDirectory(servicePath)) {
      continue
    }

    const apiPath = join(servicePath, 'api')
    if (!isDirectory(apiPath)) {
      continue
    }

    const stackPath = resolve(projectRoot, 'iac/app/src/stacks', serviceName)
    if (!existsSync(stackPath)) {
      continue
    }

    services.push({
      name: serviceName,
      stackPath,
      servicePath: apiPath,
    })
  }

  return services.sort((a, b) => a.name.localeCompare(b.name))
}

export const discoverApps = (
  projectRoot: string,
): ReadonlyArray<{
  readonly name: string
  readonly stackPath: string
  readonly appPath: string
}> => {
  const appsDir = resolve(projectRoot, 'apps')
  if (!existsSync(appsDir)) {
    return []
  }

  const apps: Array<{
    readonly name: string
    readonly stackPath: string
    readonly appPath: string
  }> = []

  for (const appName of readdirSync(appsDir)) {
    const appPath = join(appsDir, appName)
    if (!isDirectory(appPath)) {
      continue
    }

    const apiPath = join(appPath, 'api')
    if (!isDirectory(apiPath)) {
      continue
    }

    const stackPath = resolve(projectRoot, 'iac/app/src/stacks', appName)
    if (!existsSync(stackPath)) {
      continue
    }

    apps.push({
      name: appName,
      stackPath,
      appPath: apiPath,
    })
  }

  return apps.sort((a, b) => a.name.localeCompare(b.name))
}

export const buildIacInventory = (projectRoot: string): IacInventory => {
  const workspaces = discoverIacWorkspaces(projectRoot)
  const appStacks = discoverAppStacks(projectRoot)
  const ingressStacks = discoverIngressStacks(projectRoot)
  const services = discoverServices(projectRoot)
  const apps = discoverApps(projectRoot)

  return {
    workspaces: {
      projects: workspaces.projects,
      infra: workspaces.infra,
      app: { stacks: appStacks },
      ingress: { stacks: ingressStacks },
    },
    services,
    apps,
  }
}
