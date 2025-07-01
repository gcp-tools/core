import { Storage } from '@google-cloud/storage'
import type { ArtifactLocation, ArtifactManager } from './types.js'

export class GCSArtifactManager implements ArtifactManager {
  private storage: Storage
  private bucket: string

  constructor(bucket: string) {
    this.storage = new Storage()
    this.bucket = bucket
  }

  async saveArtifact(
    workflowId: string,
    step: string,
    name: string,
    data: Buffer | string | object,
  ): Promise<ArtifactLocation> {
    const filePath = `${workflowId}/${step}/${name}`
    const bucket = this.storage.bucket(this.bucket)
    const file = bucket.file(filePath)
    let content: Buffer | string
    if (typeof data === 'object' && !(data instanceof Buffer)) {
      content = JSON.stringify(data, null, 2)
    } else {
      content = data as Buffer | string
    }
    await file.save(content)
    return { uri: `gs://${this.bucket}/${filePath}`, type: 'file' }
  }

  async loadArtifact(
    location: ArtifactLocation,
  ): Promise<Buffer | string | object> {
    const [bucket, ...fileParts] = location.uri.replace('gs://', '').split('/')
    const filePath = fileParts.join('/')
    const [contents] = await this.storage
      .bucket(bucket)
      .file(filePath)
      .download()
    if (location.type === 'json') {
      return JSON.parse(contents.toString('utf8'))
    }
    return contents
  }
}
