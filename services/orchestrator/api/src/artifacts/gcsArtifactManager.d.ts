import type { ArtifactLocation, ArtifactManager } from './types.js'
export declare class GCSArtifactManager implements ArtifactManager {
  private storage
  private bucket
  constructor(bucket: string)
  saveArtifact(
    workflowId: string,
    step: string,
    name: string,
    data: Buffer | string | object,
  ): Promise<ArtifactLocation>
  loadArtifact(location: ArtifactLocation): Promise<Buffer | string | object>
}
