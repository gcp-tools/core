/**
 * Utility to create a full GitHub repo name from identity and project name.
 * @param args - Object with githubIdentity and projectName
 * @returns {string} owner/repo
 */
type CreateRepoNameArgs = {
  githubIdentity: string
  projectName: string
}
export function createRepoName({
  githubIdentity,
  projectName,
}: CreateRepoNameArgs): string {
  return `${githubIdentity}/${projectName}`
}
