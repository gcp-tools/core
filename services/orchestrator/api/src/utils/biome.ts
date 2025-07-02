import { exec } from 'child_process'

export function runBiomeLint(filePath: string): Promise<{ success: boolean; output: string }> {
  return new Promise((resolve) => {
    exec(`npx biome lint ${filePath}`, (error, stdout, stderr) => {
      if (error) {
        resolve({ success: false, output: stdout + stderr })
      } else {
        resolve({ success: true, output: stdout })
      }
    })
  })
}

export function runBiomeFormat(filePath: string): Promise<{ success: boolean; output: string }> {
  return new Promise((resolve) => {
    exec(`npx biome format --write ${filePath}`, (error, stdout, stderr) => {
      if (error) {
        resolve({ success: false, output: stdout + stderr })
      } else {
        resolve({ success: true, output: stdout })
      }
    })
  })
}
