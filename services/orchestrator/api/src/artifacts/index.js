import { LocalArtifactManager } from './localArtifactManager.js'
export function getArtifactManager() {
  // For now, always use local storage
  // In production, this could check environment variables or config
  return new LocalArtifactManager()
}
// Export for testing and potential future use
export { LocalArtifactManager }
// export { GCSArtifactManager };
//# sourceMappingURL=index.js.map
