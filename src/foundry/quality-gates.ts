import { exec } from 'child_process';
import { promisify } from 'util';
import type { FoundryQualityGateResult } from './contracts';

const execAsync = promisify(exec);

export interface GateCommand {
  name: string;
  command: string;
  optional?: boolean;
}

export class QualityGateRunner {
  private readonly defaultCommands: GateCommand[] = [
    { name: 'lint', command: 'npm run lint' },
    { name: 'build', command: 'npm run build' },
    { name: 'typecheck', command: 'npx tsc --noEmit' },
    { name: 'tests', command: 'npm run test:all' },
    { name: 'security', command: 'npm run test:security', optional: true },
    {
      name: 'documentation',
      command:
        "node -e \"const fs=require('fs');const required=['README.md','AGENTS.md','docs/PRODUCTION_DELIVERABLE_POLICY.md'];const missing=required.filter((file)=>!fs.existsSync(file));if(missing.length){console.error('Missing docs: '+missing.join(', '));process.exit(1);}console.log('Documentation baseline present');\"",
      optional: true,
    },
    { name: 'deliverable_scope', command: 'node scripts/validate-deliverable-scope.js' },
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

      if (gate.optional && this.isCommandUnavailable(execError)) {
        return {
          name: gate.name,
          command: gate.command,
          passed: true,
          exitCode: 0,
          output: [
            `Optional gate skipped because command is unavailable: ${gate.command}`,
            execError.message,
          ]
            .filter(Boolean)
            .join('\n')
            .trim(),
        };
      }

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

  private isCommandUnavailable(error: NodeJS.ErrnoException & { stderr?: string }): boolean {
    const message = `${error.message ?? ''} ${error.stderr ?? ''}`.toLowerCase();
    return (
      message.includes('is not recognized as an internal or external command') ||
      message.includes('not found') ||
      message.includes('enoent')
    );
  }
}
