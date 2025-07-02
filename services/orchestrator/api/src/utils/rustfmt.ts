import { exec } from 'child_process'

export async function runRustfmt(filePath: string): Promise<{ success: boolean; output: string }> {
  return new Promise((resolve) => {
    exec(`rustfmt --check ${filePath}`, (error, stdout, stderr) => {
      if (error) {
        resolve({ success: false, output: stdout + stderr })
      } else {
        resolve({ success: true, output: stdout })
      }
    })
  })
}

export async function runRustfmtFormat(filePath: string): Promise<{ success: boolean; output: string }> {
  return new Promise((resolve) => {
    exec(`rustfmt ${filePath}`, (error, stdout, stderr) => {
      if (error) {
        resolve({ success: false, output: stdout + stderr })
      } else {
        resolve({ success: true, output: stdout })
      }
    })
  })
}
