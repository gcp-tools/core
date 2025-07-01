import { Worker } from '@temporalio/worker'
import * as activities from './activities/agent-activities.js'
// Entrypoint for Temporal worker
async function run() {
  const worker = await Worker.create({
    workflowsPath: './src/workflows',
    activities,
    taskQueue: 'agent-orchestrator',
  })
  await worker.run()
  console.log('Worker started. Ctrl+C to exit.')
}
run().catch((err) => {
  console.error(err)
  process.exit(1)
})
//# sourceMappingURL=index.js.map
