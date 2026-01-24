import { ClientDeliveryWorkflow } from '../src/workflows/client-delivery';

async function main() {
  const workflow = new ClientDeliveryWorkflow();
  try {
    await workflow.run('mock-brief.json');
  } catch (error) {
    console.error('Workflow failed:', error);
    process.exit(1);
  }
}

main();
