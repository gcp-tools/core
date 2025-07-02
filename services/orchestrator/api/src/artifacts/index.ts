import { LocalArtifactManager } from './local-artifact-manager.js'
// import { GCSArtifactManager } from './gcs-artifact-manager.js';
import type { ArtifactManager } from './types.js'

export function getArtifactManager(): ArtifactManager {
  // For now, always use local storage
  // In production, this could check environment variables or config
  return new LocalArtifactManager()
}

// Export for testing and potential future use
export { LocalArtifactManager }
// export { GCSArtifactManager };
