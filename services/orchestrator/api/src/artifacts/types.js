import { z } from 'zod'
export const ArtifactLocationSchema = z.object({
  uri: z.string().min(1, 'URI is required'), // e.g., "file:///..." or "gs://..."
  type: z.enum(['file', 'directory', 'json']),
})
//# sourceMappingURL=types.js.map
