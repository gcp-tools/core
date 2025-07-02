import { exec } from 'child_process'

export async function runRuff(filePath: string): Promise<{ success: boolean; output: string }> {
  return new Promise((resolve) => {
    exec(`ruff check ${filePath}`, (error, stdout, stderr) => {
      if (error) {
        resolve({ success: false, output: stdout + stderr })
      } else {
        resolve({ success: true, output: stdout })
      }
    })
  })
}
