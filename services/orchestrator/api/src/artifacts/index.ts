import { LocalArtifactManager } from './localArtifactManager.js'
// import { GCSArtifactManager } from './gcsArtifactManager.js';
import type { ArtifactManager } from './types.js'

export function getArtifactManager(): ArtifactManager {
  // For now, always use local storage
  // In production, this could check environment variables or config
  return new LocalArtifactManager()
}

// Export for testing and potential future use
export { LocalArtifactManager }
// export { GCSArtifactManager };
