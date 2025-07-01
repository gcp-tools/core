import type { ArtifactLocation, ArtifactManager } from './types.js'
export declare class LocalArtifactManager implements ArtifactManager {
  private baseDir
  constructor(baseDir?: string)
  saveArtifact(
    workflowId: string,
    step: string,
    name: string,
    data: Buffer | string | object,
  ): Promise<ArtifactLocation>
  loadArtifact(location: ArtifactLocation): Promise<Buffer | string | object>
}
