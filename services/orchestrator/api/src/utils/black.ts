import { exec } from 'child_process'

export async function runBlack(filePath: string): Promise<{ success: boolean; output: string }> {
  return new Promise((resolve) => {
    exec(`black --check ${filePath}`, (error, stdout, stderr) => {
      if (error) {
        resolve({ success: false, output: stdout + stderr })
      } else {
        resolve({ success: true, output: stdout })
      }
    })
  })
}

export async function runBlackFormat(filePath: string): Promise<{ success: boolean; output: string }> {
  return new Promise((resolve) => {
    exec(`black ${filePath}`, (error, stdout, stderr) => {
      if (error) {
        resolve({ success: false, output: stdout + stderr })
      } else {
        resolve({ success: true, output: stdout })
      }
    })
  })
}
