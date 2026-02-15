import { v4 as uuidv4 } from 'uuid';
import { EnterpriseStateMachine } from '@foundry/core/state-machine';
import type { StateContext, StateEvent, StatePhase } from '@foundry/types';
import { Database } from '@/storage/db';
import { FoundryCollaborationHub } from './collaboration-hub';
import { FoundryCoworkBridge } from './cowork-bridge';
import { QualityGateRunner } from './quality-gates';
import { createFoundryStateMachineDefinition } from './state-definition';
import type {
  FoundryExecutionReport,
  FoundryExecutionRequest,
  FoundryMessage,
  FoundryQualityGateResult,
  FoundryReviewResult,
  FoundryTask,
} from './contracts';

type GateStatus = 'not_started' | 'passed' | 'failed';

interface ExecutionCheckpoint {
  resumeKey: string;
  projectId: string;
  phaseIndex: number;
  completedStepSignatures: string[];
  completedTaskSignatures: string[];
  gateStatus: GateStatus;
  tasks: FoundryTask[];
  messages: FoundryMessage[];
  gateResults: FoundryQualityGateResult[];
  stepOutcomes: Record<string, unknown>;
  updatedAt: number;
}

export class FoundryOrchestrator {
  private readonly collaborationHub = new FoundryCollaborationHub();
  private readonly coworkBridge = new FoundryCoworkBridge();
  private readonly gateRunner = new QualityGateRunner();
  private readonly db = Database.Client();
  private tasks: FoundryTask[] = [];
  private messages: FoundryMessage[] = [];

  public async execute(request: FoundryExecutionRequest): Promise<FoundryExecutionReport> {
    const startedAt = new Date().toISOString();
    const resumeKey = request.resumeKey?.trim() || request.projectId;
    const checkpoint = await this.loadCheckpoint(request.projectId, resumeKey);

    this.tasks = [...checkpoint.tasks];
    this.messages = [...checkpoint.messages];
    this.collaborationHub.clear();
    this.coworkBridge.initialize();

    const stateMachine = new EnterpriseStateMachine({
      definition: createFoundryStateMachineDefinition(),
      context: this.createInitialContext(request),
    });

    const maxIterations = Math.max(1, request.maxIterations || 2);
    const runQualityGates = request.runQualityGates !== false;
    const gateResults: FoundryQualityGateResult[] = [...checkpoint.gateResults];
    let review: FoundryReviewResult = {
      passed: true,
      notes: ['No release review executed'],
      reviewer: 'QA_LEAD',
    };

    try {
      await this.transitionStep(stateMachine, 'INIT_PROJECT', 'transition:init_project', checkpoint, gateResults);
      await this.runRoleTaskWithCheckpoint(
        stateMachine,
        'task:discovery',
        checkpoint,
        gateResults,
        'PRODUCT_MANAGER',
        'Discovery and intent decomposition',
        this.buildDiscoveryTask(request),
      );

      await this.transitionStep(stateMachine, 'START_PHASE', 'transition:start_architecture', checkpoint, gateResults);
      await this.runRoleTaskWithCheckpoint(
        stateMachine,
        'task:architecture',
        checkpoint,
        gateResults,
        'CTO_ORCHESTRATOR',
        'Architecture and execution strategy',
        this.buildArchitectureTask(request),
      );

      await this.transitionStep(stateMachine, 'START_PHASE', 'transition:start_security', checkpoint, gateResults);
      await this.runRoleTaskWithCheckpoint(
        stateMachine,
        'task:security_baseline',
        checkpoint,
        gateResults,
        'SECURITY_LEAD',
        'Security baseline and compliance checks',
        this.buildSecurityTask(request),
      );

      await this.transitionStep(
        stateMachine,
        'START_FEATURE_LOOP',
        'transition:enter_feature_loop',
        checkpoint,
        gateResults,
      );

      for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
        await this.transitionStep(
          stateMachine,
          'START_FEATURE_LOOP',
          `transition:feature_loop_start:${iteration}`,
          checkpoint,
          gateResults,
        );
        const planningOk = await this.runRoleTaskWithCheckpoint(
          stateMachine,
          `task:feature_planning:${iteration}`,
          checkpoint,
          gateResults,
          'PRODUCT_MANAGER',
          `Feature planning iteration ${iteration}`,
          this.buildPlanningTask(request, iteration),
        );

        if (!planningOk) {
          break;
        }

        await this.transitionStep(
          stateMachine,
          'ASSIGN_TASK',
          `transition:assign_task:${iteration}`,
          checkpoint,
          gateResults,
        );
        const implementationOk = await this.runRoleTaskWithCheckpoint(
          stateMachine,
          `task:feature_implementation:${iteration}`,
          checkpoint,
          gateResults,
          'STAFF_BACKEND_ENGINEER',
          `Feature implementation iteration ${iteration}`,
          this.buildImplementationTask(request, iteration),
        );

        if (!implementationOk) {
          await this.transitionStep(
            stateMachine,
            'ABORT',
            `transition:abort_on_implementation:${iteration}`,
            checkpoint,
            gateResults,
          );
          break;
        }

        await this.transitionStep(
          stateMachine,
          'COMPLETE_TASK',
          `transition:complete_implementation:${iteration}`,
          checkpoint,
          gateResults,
        );
        const peerReviewOk = await this.runRoleTaskWithCheckpoint(
          stateMachine,
          `task:peer_review:${iteration}`,
          checkpoint,
          gateResults,
          'QA_LEAD',
          `Peer review iteration ${iteration}`,
          this.buildReviewTask(request, iteration),
        );

        if (!peerReviewOk) {
          await this.transitionStep(
            stateMachine,
            'REJECT_RELEASE',
            `transition:review_reject:${iteration}`,
            checkpoint,
            gateResults,
          );
          await this.runRoleTaskWithCheckpoint(
            stateMachine,
            `task:review_remediation:${iteration}`,
            checkpoint,
            gateResults,
            'STAFF_BACKEND_ENGINEER',
            `Remediation for review findings iteration ${iteration}`,
            'Address review findings and provide a concise remediation summary.',
          );
          await this.transitionStep(
            stateMachine,
            'COMPLETE_TASK',
            `transition:remediation_complete:${iteration}`,
            checkpoint,
            gateResults,
          );
          await this.transitionStep(
            stateMachine,
            'APPROVE_PHASE',
            `transition:feature_approve:${iteration}`,
            checkpoint,
            gateResults,
          );
        } else {
          await this.transitionStep(
            stateMachine,
            'APPROVE_PHASE',
            `transition:feature_approve:${iteration}`,
            checkpoint,
            gateResults,
          );
        }

        if (iteration < maxIterations) {
          await this.transitionStep(
            stateMachine,
            'COMPLETE_FEATURE',
            `transition:complete_feature:${iteration}`,
            checkpoint,
            gateResults,
          );
        }
      }

      await this.transitionStep(stateMachine, 'APPROVE_PHASE', 'transition:approve_hardening', checkpoint, gateResults);

      if (runQualityGates) {
        await this.transitionStep(stateMachine, 'RUN_GATES', 'transition:run_gates', checkpoint, gateResults);
        const initialGateResults = await this.gateStep('gates:initial', checkpoint, gateResults, request.repoRoot);

        if (initialGateResults.every((gate) => gate.passed)) {
          checkpoint.gateStatus = 'passed';
          await this.transitionStep(stateMachine, 'GATES_PASSED', 'transition:gates_passed', checkpoint, gateResults);
        } else {
          checkpoint.gateStatus = 'failed';
          await this.transitionStep(stateMachine, 'GATES_FAILED', 'transition:gates_failed', checkpoint, gateResults);
          await this.transitionStep(
            stateMachine,
            'START_REMEDIATION',
            'transition:start_remediation',
            checkpoint,
            gateResults,
          );
          await this.runRoleTaskWithCheckpoint(
            stateMachine,
            'task:gate_remediation',
            checkpoint,
            gateResults,
            'SECURITY_LEAD',
            'Quality gate remediation plan',
            this.buildRemediationTask(initialGateResults),
          );
          await this.transitionStep(
            stateMachine,
            'COMPLETE_REMEDIATION',
            'transition:complete_remediation',
            checkpoint,
            gateResults,
          );

          const rerunGateResults = await this.gateStep('gates:rerun', checkpoint, gateResults, request.repoRoot);
          if (rerunGateResults.every((gate) => gate.passed)) {
            checkpoint.gateStatus = 'passed';
            await this.transitionStep(
              stateMachine,
              'GATES_PASSED',
              'transition:gates_passed_after_remediation',
              checkpoint,
              gateResults,
            );
          } else {
            checkpoint.gateStatus = 'failed';
            await this.transitionStep(stateMachine, 'ABORT', 'transition:abort_after_gates', checkpoint, gateResults);
          }
        }
      }

      if (stateMachine.getCurrentPhase() !== 'aborted') {
        await this.transitionStep(
          stateMachine,
          'APPROVE_PHASE',
          'transition:approve_release_readiness',
          checkpoint,
          gateResults,
        );
        await this.transitionStep(
          stateMachine,
          'REQUEST_RELEASE',
          'transition:request_release',
          checkpoint,
          gateResults,
        );
        review = await this.runReleaseReview(stateMachine, request, gateResults, checkpoint);
        await this.transitionStep(
          stateMachine,
          review.passed ? 'APPROVE_RELEASE' : 'REJECT_RELEASE',
          review.passed ? 'transition:approve_release' : 'transition:reject_release',
          checkpoint,
          gateResults,
        );
      }
    } catch (error) {
      if (stateMachine.getCurrentPhase() !== 'aborted') {
        await this.transitionStep(stateMachine, 'ABORT', 'transition:abort_on_exception', checkpoint, gateResults);
      }

      review = {
        passed: false,
        reviewer: 'QA_LEAD',
        notes: [error instanceof Error ? error.message : String(error)],
      };
    }

    await this.saveCheckpoint(checkpoint, gateResults);

    const finishedAt = new Date().toISOString();
    const finalPhase = stateMachine.getCurrentPhase();
    const status = finalPhase === 'released' ? 'completed' : 'failed';

    return {
      projectId: request.projectId,
      status,
      iterationCount: maxIterations,
      phase: finalPhase,
      tasks: [...this.tasks],
      messages: [...this.messages],
      gateResults,
      review,
      startedAt,
      finishedAt,
    };
  }

  private async runReleaseReview(
    stateMachine: EnterpriseStateMachine,
    request: FoundryExecutionRequest,
    gateResults: FoundryQualityGateResult[],
    checkpoint: ExecutionCheckpoint,
  ): Promise<FoundryReviewResult> {
    const passedGates = gateResults.filter((gate) => gate.passed).length;
    const failedGates = gateResults.length - passedGates;
    const reviewTask = [
      `Project: ${request.projectName}`,
      `Gate results: ${passedGates} passed, ${failedGates} failed.`,
      'Perform final release readiness review and return a go/no-go recommendation.',
    ].join(' ');

    const ok = await this.runRoleTaskWithCheckpoint(
      stateMachine,
      'task:final_release_review',
      checkpoint,
      gateResults,
      'QA_LEAD',
      'Final release review',
      reviewTask,
    );

    return {
      passed: ok && failedGates === 0,
      reviewer: 'QA_LEAD',
      notes: [
        ok ? 'QA review completed successfully.' : 'QA review failed or unavailable.',
        failedGates === 0 ? 'All quality gates passed.' : 'One or more quality gates failed.',
      ],
    };
  }

  private async runRoleTaskWithCheckpoint(
    stateMachine: EnterpriseStateMachine,
    signature: string,
    checkpoint: ExecutionCheckpoint,
    gateResults: FoundryQualityGateResult[],
    roleId: string,
    title: string,
    taskBody: string,
  ): Promise<boolean> {
    if (checkpoint.completedTaskSignatures.includes(signature)) {
      return true;
    }

    const ok = await this.runRoleTask(stateMachine, roleId, title, taskBody);
    checkpoint.stepOutcomes[signature] = ok;
    if (ok) {
      checkpoint.completedTaskSignatures.push(signature);
      checkpoint.completedStepSignatures.push(signature);
    }

    await this.saveCheckpoint(checkpoint, gateResults);
    return ok;
  }

  private async gateStep(
    signature: string,
    checkpoint: ExecutionCheckpoint,
    gateResults: FoundryQualityGateResult[],
    repoRoot: string,
  ): Promise<FoundryQualityGateResult[]> {
    if (checkpoint.completedStepSignatures.includes(signature)) {
      const cached = checkpoint.stepOutcomes[signature];
      if (Array.isArray(cached)) {
        return cached as FoundryQualityGateResult[];
      }

      return [];
    }

    const results = await this.gateRunner.runAll(repoRoot);
    gateResults.push(...results);
    checkpoint.gateResults = [...gateResults];
    checkpoint.stepOutcomes[signature] = results;
    checkpoint.completedStepSignatures.push(signature);
    await this.saveCheckpoint(checkpoint, gateResults);
    return results;
  }

  private async transitionStep(
    machine: EnterpriseStateMachine,
    event: StateEvent,
    signature: string,
    checkpoint: ExecutionCheckpoint,
    gateResults: FoundryQualityGateResult[],
  ): Promise<void> {
    const alreadyCompleted = checkpoint.completedStepSignatures.includes(signature);
    if (!machine.can(event)) {
      return;
    }

    await machine.dispatch(event);

    if (!alreadyCompleted) {
      checkpoint.completedStepSignatures.push(signature);
      checkpoint.phaseIndex += 1;
      await this.saveCheckpoint(checkpoint, gateResults);
    }
  }

  private async runRoleTask(
    stateMachine: EnterpriseStateMachine,
    roleId: string,
    title: string,
    taskBody: string,
  ): Promise<boolean> {
    const phase = stateMachine.getCurrentPhase();
    const task: FoundryTask = {
      id: uuidv4(),
      title,
      roleId,
      phase,
      status: 'in_progress',
      priority: 'high',
      dependsOn: [],
      payload: { taskBody },
    };
    this.tasks.push(task);

    this.recordBroadcast('CTO_ORCHESTRATOR', `phase:${phase}`, `Assigned to ${roleId}: ${title}`, {
      taskId: task.id,
    });

    const result = await this.coworkBridge.dispatchRoleTask(roleId, taskBody, {
      phase,
      title,
      taskId: task.id,
    });

    if (!result || !result.metadata.success) {
      task.status = 'failed';
      task.summary = result?.metadata.error || 'Agent unavailable or task failed';
      this.recordBroadcast(roleId, `phase:${phase}`, `Task failed: ${task.summary}`, { taskId: task.id });
      return false;
    }

    task.status = 'completed';
    task.summary = this.summarizeResult(result.output);
    this.recordBroadcast(roleId, `phase:${phase}`, `Task completed: ${task.summary}`, { taskId: task.id });
    return true;
  }

  private recordBroadcast(
    from: string,
    topic: string,
    content: string,
    metadata?: Record<string, unknown>,
  ): void {
    const message = this.collaborationHub.broadcast(from, topic, content, metadata);
    this.messages.push(message);
  }

  private summarizeResult(output: unknown): string {
    if (typeof output === 'string') {
      return output.slice(0, 220);
    }

    if (output === null || output === undefined) {
      return 'Completed with no structured output';
    }

    try {
      return JSON.stringify(output).slice(0, 220);
    } catch {
      return 'Completed with non-serializable output';
    }
  }

  private createInitialContext(request: FoundryExecutionRequest): StateContext {
    return {
      project: {
        name: request.projectName,
        repo_root: request.repoRoot,
        stakeholders: [],
        environments: ['dev'],
        compliance_targets: ['internal-governance'],
        risk_tolerance: 'low',
      },
      artifacts: {},
      backlog: { items: [] },
      current_phase: 'idle',
      current_feature_id: null,
      iteration: {
        phase_iteration: 0,
        remediation_iteration: 0,
      },
      evidence: { items: [] },
      last_gate_results: {},
    };
  }

  private async loadCheckpoint(projectId: string, resumeKey: string): Promise<ExecutionCheckpoint> {
    const rows = await this.db.query(
      'SELECT * FROM orchestrator_checkpoint WHERE resume_key = ?',
      [resumeKey],
    ) as Record<string, unknown>[];

    if (rows.length === 0) {
      return {
        resumeKey,
        projectId,
        phaseIndex: 0,
        completedStepSignatures: [],
        completedTaskSignatures: [],
        gateStatus: 'not_started',
        tasks: [],
        messages: [],
        gateResults: [],
        stepOutcomes: {},
        updatedAt: Date.now(),
      };
    }

    const row = rows[0];
    return {
      resumeKey,
      projectId,
      phaseIndex: Number(row.phase_index ?? 0),
      completedStepSignatures: this.parseStringArray(row.completed_step_signatures),
      completedTaskSignatures: this.parseStringArray(row.completed_task_signatures),
      gateStatus: this.parseGateStatus(row.gate_status),
      tasks: this.parseObjectArray<FoundryTask>(row.tasks),
      messages: this.parseObjectArray<FoundryMessage>(row.messages),
      gateResults: this.parseObjectArray<FoundryQualityGateResult>(row.gate_results),
      stepOutcomes: this.parseObject(row.step_outcomes),
      updatedAt: Number(row.updated_at ?? Date.now()),
    };
  }

  private async saveCheckpoint(
    checkpoint: ExecutionCheckpoint,
    gateResults: FoundryQualityGateResult[],
  ): Promise<void> {
    checkpoint.tasks = [...this.tasks];
    checkpoint.messages = [...this.messages];
    checkpoint.gateResults = [...gateResults];
    checkpoint.updatedAt = Date.now();

    await this.db.$client.execute({
      sql: `
        INSERT INTO orchestrator_checkpoint
          (resume_key, project_id, phase_index, completed_step_signatures, completed_task_signatures, gate_status, tasks, messages, gate_results, step_outcomes, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT (resume_key) DO UPDATE SET
          project_id = excluded.project_id,
          phase_index = excluded.phase_index,
          completed_step_signatures = excluded.completed_step_signatures,
          completed_task_signatures = excluded.completed_task_signatures,
          gate_status = excluded.gate_status,
          tasks = excluded.tasks,
          messages = excluded.messages,
          gate_results = excluded.gate_results,
          step_outcomes = excluded.step_outcomes,
          updated_at = excluded.updated_at
      `,
      args: [
        checkpoint.resumeKey,
        checkpoint.projectId,
        checkpoint.phaseIndex,
        JSON.stringify(checkpoint.completedStepSignatures),
        JSON.stringify(checkpoint.completedTaskSignatures),
        checkpoint.gateStatus,
        JSON.stringify(checkpoint.tasks),
        JSON.stringify(checkpoint.messages),
        JSON.stringify(checkpoint.gateResults),
        JSON.stringify(checkpoint.stepOutcomes),
        checkpoint.updatedAt,
      ],
    });
  }

  private parseStringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.map((item) => String(item));
    }

    if (typeof value !== 'string' || value.length === 0) {
      return [];
    }

    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? parsed.map((item) => String(item)) : [];
    } catch {
      return [];
    }
  }

  private parseObject(value: unknown): Record<string, unknown> {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }

    if (typeof value !== 'string' || value.length === 0) {
      return {};
    }

    try {
      const parsed = JSON.parse(value) as unknown;
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? parsed as Record<string, unknown>
        : {};
    } catch {
      return {};
    }
  }

  private parseObjectArray<T>(value: unknown): T[] {
    if (Array.isArray(value)) {
      return value as T[];
    }

    if (typeof value !== 'string' || value.length === 0) {
      return [];
    }

    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? parsed as T[] : [];
    } catch {
      return [];
    }
  }

  private parseGateStatus(value: unknown): GateStatus {
    if (value === 'passed' || value === 'failed' || value === 'not_started') {
      return value;
    }

    return 'not_started';
  }

  private buildDiscoveryTask(request: FoundryExecutionRequest): string {
    const parts = [
      `Project: ${request.projectName}`,
      request.company ? `Company: ${request.company}` : '',
      request.industry ? `Industry: ${request.industry}` : '',
      request.description ? `Intent: ${request.description}` : '',
      'Create a concise discovery brief and top execution priorities.',
    ];

    return parts.filter(Boolean).join(' ');
  }

  private buildArchitectureTask(request: FoundryExecutionRequest): string {
    return [
      `Project: ${request.projectName}.`,
      'Design a secure, scalable architecture with major components and trade-offs.',
      'Call out dependencies, risks, and implementation sequencing.',
    ].join(' ');
  }

  private buildSecurityTask(request: FoundryExecutionRequest): string {
    return [
      `Project: ${request.projectName}.`,
      'Create security baseline controls, threat model highlights, and compliance checkpoints.',
    ].join(' ');
  }

  private buildPlanningTask(request: FoundryExecutionRequest, iteration: number): string {
    return [
      `Project: ${request.projectName}.`,
      `Feature loop iteration: ${iteration}.`,
      'Break the objective into actionable implementation tasks and acceptance criteria.',
    ].join(' ');
  }

  private buildImplementationTask(request: FoundryExecutionRequest, iteration: number): string {
    return [
      `Project: ${request.projectName}.`,
      `Implement planned work for feature loop iteration ${iteration}.`,
      'Return concise implementation notes and any blockers.',
    ].join(' ');
  }

  private buildReviewTask(request: FoundryExecutionRequest, iteration: number): string {
    return [
      `Project: ${request.projectName}.`,
      `Review implementation output from feature loop iteration ${iteration}.`,
      'Provide pass/fail decision with clear remediation feedback.',
    ].join(' ');
  }

  private buildRemediationTask(gates: FoundryQualityGateResult[]): string {
    const failed = gates.filter((gate) => !gate.passed);
    if (failed.length === 0) {
      return 'No remediation needed.';
    }

    return [
      'Create a remediation plan for failed quality gates.',
      ...failed.map((gate) => `${gate.name}: ${gate.command}`),
    ].join(' ');
  }
}

export function createFoundryExecutionRequest(
  intent: string,
  repoRoot: string,
  runQualityGates = true,
): FoundryExecutionRequest {
  const normalizedIntent = intent.trim() || 'General engineering execution';
  return {
    projectId: uuidv4(),
    projectName: normalizedIntent.slice(0, 80),
    repoRoot,
    description: normalizedIntent,
    maxIterations: 2,
    runQualityGates,
  };
}
