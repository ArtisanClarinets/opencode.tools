import { JsonDatabase } from '../../../src/database/json-db';
import * as fs from 'fs';
import * as path from 'path';

describe('JsonDatabase', () => {
  const testDir = 'test-data';
  let db: JsonDatabase;

  beforeAll(() => {
    if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should save and retrieve research', async () => {
    db = new JsonDatabase(testDir);
    const record = {
      id: 'test-1',
      topic: 'Test Topic',
      status: 'in_progress' as const,
      startedAt: new Date().toISOString(),
      findings: []
    };

    await db.saveResearch(record);
    const retrieved = await db.getResearch('test-1');
    expect(retrieved).toEqual(record);
  });
});
