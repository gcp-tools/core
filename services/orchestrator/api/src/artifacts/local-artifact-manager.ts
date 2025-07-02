import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import type { ArtifactLocation, ArtifactManager } from './types.js'

export class LocalArtifactManager implements ArtifactManager {
  constructor(private baseDir = 'artifacts') {}

  async saveArtifact(
    workflowId: string,
    step: string,
    name: string,
    data: Buffer | string | object,
  ): Promise<ArtifactLocation> {
    const dir = join(this.baseDir, workflowId, step)
    await fs.mkdir(dir, { recursive: true })
    const filePath = join(dir, name)
    if (typeof data === 'object' && !(data instanceof Buffer)) {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8')
    } else {
      await fs.writeFile(filePath, data as Buffer | string)
    }
    return { uri: `file://${filePath}`, type: 'file' }
  }

  async loadArtifact(
    location: ArtifactLocation,
  ): Promise<Buffer | string | object> {
    const filePath = location.uri.replace('file://', '')
    const content = await fs.readFile(filePath, 'utf8')
    if (location.type === 'json') {
      return JSON.parse(content)
    }
    return content
  }
}
