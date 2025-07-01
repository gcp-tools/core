import { z } from 'zod'

export const ArtifactLocationSchema = z.object({
  uri: z.string().min(1, 'URI is required'), // e.g., "file:///..." or "gs://..."
  type: z.enum(['file', 'directory', 'json']),
})

export type ArtifactLocation = z.infer<typeof ArtifactLocationSchema>

export interface ArtifactManager {
  saveArtifact(
    workflowId: string,
    step: string,
    name: string,
    data: Buffer | string | object,
  ): Promise<ArtifactLocation>
  loadArtifact(location: ArtifactLocation): Promise<Buffer | string | object>
  listArtifacts?(workflowId: string): Promise<ArtifactLocation[]>
}
