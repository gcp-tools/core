import { Storage } from '@google-cloud/storage'
export class GCSArtifactManager {
  storage
  bucket
  constructor(bucket) {
    this.storage = new Storage()
    this.bucket = bucket
  }
  async saveArtifact(workflowId, step, name, data) {
    const filePath = `${workflowId}/${step}/${name}`
    const bucket = this.storage.bucket(this.bucket)
    const file = bucket.file(filePath)
    let content
    if (typeof data === 'object' && !(data instanceof Buffer)) {
      content = JSON.stringify(data, null, 2)
    } else {
      content = data
    }
    await file.save(content)
    return { uri: `gs://${this.bucket}/${filePath}`, type: 'file' }
  }
  async loadArtifact(location) {
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
//# sourceMappingURL=gcsArtifactManager.js.map
