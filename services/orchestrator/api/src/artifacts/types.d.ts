import type { z } from 'zod'
export declare const ArtifactLocationSchema: z.ZodObject<
  {
    uri: z.ZodString
    type: z.ZodEnum<['file', 'directory', 'json']>
  },
  'strip',
  z.ZodTypeAny,
  {
    type: 'file' | 'directory' | 'json'
    uri: string
  },
  {
    type: 'file' | 'directory' | 'json'
    uri: string
  }
>
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
