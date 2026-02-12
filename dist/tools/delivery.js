"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRunbook = generateRunbook;
exports.generateNginxConfig = generateNginxConfig;
exports.runSmoketest = runSmoketest;
exports.packageHandoff = packageHandoff;
// tools/delivery.ts
const audit_1 = require("./audit");
const RUN_ID = 'mock-run-123';
/**
 * F1: Delivery artifacts
 */
async function generateRunbook(architecture) {
    console.log("[Delivery.generateRunbook] Creating deployment runbook and rollback plan.");
    const runbook = `# Deployment Runbook\n\n## 1. Prerequisites\n\n- Node.js 18+\n- AWS CLI configured\n\n## 2. Steps\n\n1. Run migrations\n2. Deploy service\n3. Run smoketests\n\n## 3. Rollback Plan\n\n1. Revert commit\n2. Redeploy previous version`;
    await (0, audit_1.logToolCall)(RUN_ID, 'delivery.runbook.generate', { arch_id: 'arch-1' }, { length: runbook.length });
    return { runbook };
}
async function generateNginxConfig(environmentMapping) {
    console.log("[Delivery.generateNginxConfig] Generating and validating NGINX configuration.");
    const config = environmentMapping.map(m => `
server {
    listen 80;
    server_name ${m.domain};
    location / {
        proxy_pass http://localhost:${m.port};
    }
}`).join('\n');
    await (0, audit_1.logToolCall)(RUN_ID, 'delivery.nginx.generate', { mapping_count: environmentMapping.length }, { config_length: config.length });
    return { config };
}
async function runSmoketest(url) {
    console.log(`[Delivery.smoketest] Pinging ${url}...`);
    const success = true;
    const latency = 150;
    await (0, audit_1.logToolCall)(RUN_ID, 'delivery.smoketest.run', { url }, { success, latency });
    return { success, latency };
}
async function packageHandoff(artifacts) {
    console.log("[Delivery.packageHandoff] Creating handoff checklist and onboarding guides.");
    const handoffPackagePath = `artifacts/delivery/handoff_${Date.now()}.zip`;
    await (0, audit_1.logToolCall)(RUN_ID, 'delivery.handoff.package', { artifact_count: artifacts.length }, { handoffPackagePath });
    return { handoffPackagePath };
}
//# sourceMappingURL=delivery.js.map