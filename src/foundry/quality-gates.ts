import { exec } from 'child_process';
import { promisify } from 'util';
import type { FoundryQualityGateResult } from './contracts';

const execAsync = promisify(exec);

export interface GateCommand {
  name: string;
  command: string;
}

export class QualityGateRunner {
  private readonly defaultCommands: GateCommand[] = [
    { name: 'lint', command: 'npm run lint' },
    { name: 'build', command: 'npm run build' },
    { name: 'typecheck', command: 'npx tsc --noEmit' },
    { name: 'tests', command: 'npm run test:all' },
  ];

  public async runAll(
    cwd: string,
    commands: GateCommand[] = this.defaultCommands,
  ): Promise<FoundryQualityGateResult[]> {
    const results: FoundryQualityGateResult[] = [];

    for (const gate of commands) {
      results.push(await this.runGate(gate, cwd));
    }

    return results;
  }

  private async runGate(gate: GateCommand, cwd: string): Promise<FoundryQualityGateResult> {
    try {
      const { stdout, stderr } = await execAsync(gate.command, {
        cwd,
        maxBuffer: 1024 * 1024 * 20,
      });

      return {
        name: gate.name,
        command: gate.command,
        passed: true,
        exitCode: 0,
        output: [stdout, stderr].filter(Boolean).join('\n').trim(),
      };
    } catch (error) {
      const execError = error as NodeJS.ErrnoException & {
        code?: string | number;
        stdout?: string;
        stderr?: string;
      };

      const exitCode = typeof execError.code === 'number' ? execError.code : 1;

      return {
        name: gate.name,
        command: gate.command,
        passed: false,
        exitCode,
        output: [execError.stdout, execError.stderr, execError.message]
          .filter(Boolean)
          .join('\n')
          .trim(),
      };
    }
  }
}
