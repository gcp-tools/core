import { FastMCP } from 'fastmcp'
import { z } from 'zod'

import pkgJson from '../package.json' with { type: 'json' }
import { buildServerInstructions } from './lib/instructions.mjs'
import { registerTools } from './tools/index.mjs'

type PackageJson = {
  readonly name: string
  readonly version: string
}

const packageInfo = pkgJson as PackageJson

const parseSemver = (value: string): `${number}.${number}.${number}` => {
  const match = value.match(/^(\d+)\.(\d+)\.(\d+)/)
  if (!match) {
    throw new Error(`Invalid semantic version: ${value}`)
  }

  const [, major, minor, patch] = match
  const semver = `${major}.${minor}.${patch}` as `${number}.${number}.${number}`
  return semver
}

const createServer = async (): Promise<FastMCP> => {
  const instructions = await buildServerInstructions()

  const server = new FastMCP({
    name: packageInfo.name,
    version: parseSemver(packageInfo.version),
    instructions,
  })

  const healthParameters = z
    .object({})
    .describe('No parameters are required for the health check tool.')

  server.addTool({
    name: 'health_check',
    description: 'Report server health metadata.',
    parameters: healthParameters,
    execute: async () => {
      return await Promise.resolve(
        JSON.stringify({
          status: 'ok',
          version: packageInfo.version,
        }),
      )
    },
  })

  await registerTools(server)

  return server
}

const main = async (): Promise<void> => {
  const server = await createServer()

  await server.start({
    transportType: 'stdio',
  })
}

void main()
