import * as fs from 'fs';
import * as path from 'path';

const REQUIRED_FILES = [
  'src/runtime/run-store.ts',
  'src/runtime/audit.ts',
  'src/runtime/artifacts.ts',
  'src/runtime/replay.ts',
  'src/runtime/cache.ts',
  'src/runtime/tool-wrapper.ts',
  'src/security/secrets.ts',
  'src/security/redaction.ts',
  'src/governance/policy-engine.ts',
  'src/governance/rubric.ts',
  'src/search/types.ts',
  'src/search/fetcher.ts',
  'src/evidence/store.ts',
  'src/retrieval/passage-index.ts',
  'src/analysis/claim-extractor.ts',
  'src/review/revision-loop.ts',
  'src/workflows/client-delivery.ts'
];

async function verify() {
  console.log('🔍 Verifying System Completeness...');
  let missing = 0;

  for (const file of REQUIRED_FILES) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ Found: ${file}`);
    } else {
      console.log(`❌ MISSING: ${file}`);
      missing++;
    }
  }

  if (missing > 0) {
    console.error(`\nFAILED: ${missing} required files are missing.`);
    process.exit(1);
  } else {
    console.log('\n✅ System Verification Passed: All required components exist.');
  }
}

verify();
