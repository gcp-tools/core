import { readFile, readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { type State, stateSchema } from '../types.mjs'

export async function readStateFromFile(): Promise<State | null> {
  try {
    const pipelineStatesDir = join(process.cwd(), 'pipeline-states')

    // Check if directory exists
    try {
      await readdir(pipelineStatesDir)
    } catch {
      console.log('No pipeline-states directory found')
      return null
    }

    // Read all files in the directory
    const files = await readdir(pipelineStatesDir)
    const stateFiles = files.filter((file) => file.endsWith('.json'))

    if (stateFiles.length === 0) {
      console.log('No state files found')
      return null
    }

    // Get file stats and find the most recent one
    const fileStats = await Promise.all(
      stateFiles.map(async (file) => {
        const filepath = join(pipelineStatesDir, file)
        const stats = await stat(filepath)
        return { file, stats, filepath }
      }),
    )

    // Sort by creation time (most recent first)
    fileStats.sort(
      (a, b) => b.stats.birthtime.getTime() - a.stats.birthtime.getTime(),
    )

    const mostRecentFile = fileStats[0]
    if (!mostRecentFile) {
      console.log('No valid state files found')
      return null
    }

    // Read and parse the most recent state file
    const fileContent = await readFile(mostRecentFile.filepath, 'utf8')
    const state = stateSchema.safeParse(JSON.parse(fileContent))
    if (!state.success) {
      console.error('Invalid state file:', state.error)
      return null
    }

    console.log(`Loaded most recent state from: ${mostRecentFile.filepath}`)
    console.log(
      `Outcome: ${state.data.META.outcome}, Version: ${state.data.META.version}`,
    )
    console.log(`File created: ${mostRecentFile.stats.birthtime.toISOString()}`)

    return state.data
  } catch (error) {
    console.error('Error loading most recent state:', error)
    return null
  }
}
