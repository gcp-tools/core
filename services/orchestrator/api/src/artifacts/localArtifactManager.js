import { promises as fs } from 'node:fs'
import { join } from 'node:path'
export class LocalArtifactManager {
  baseDir
  constructor(baseDir = 'artifacts') {
    this.baseDir = baseDir
  }
  async saveArtifact(workflowId, step, name, data) {
    const dir = join(this.baseDir, workflowId, step)
    await fs.mkdir(dir, { recursive: true })
    const filePath = join(dir, name)
    if (typeof data === 'object' && !(data instanceof Buffer)) {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8')
    } else {
      await fs.writeFile(filePath, data)
    }
    return { uri: `file://${filePath}`, type: 'file' }
  }
  async loadArtifact(location) {
    const filePath = location.uri.replace('file://', '')
    const content = await fs.readFile(filePath, 'utf8')
    if (location.type === 'json') {
      return JSON.parse(content)
    }
    return content
  }
}
//# sourceMappingURL=localArtifactManager.js.map
