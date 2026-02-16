/**
 * Collaborative Workspace System
 * 
 * Enhanced workspace management with project scoping, artifact versioning,
 * threaded feedback, conflict resolution, and compliance package export.
 */

import { logger } from '../../runtime/logger';
import { EventBus } from '../orchestrator/event-bus';
import { Blackboard, Artifact, FeedbackEntry } from '../orchestrator/blackboard';
import { ArtifactVersioning, ArtifactVersion } from './artifact-versioning';
import { FeedbackThreads, FeedbackThread } from './feedback-threads';

export type WorkspaceStatus = 'active' | 'archived' | 'frozen' | 'merging';
export type ConflictResolutionStrategy = 'last-write-wins' | 'merge' | 'reject' | 'manual';

export interface ProjectWorkspace {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  status: WorkspaceStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  members: string[];
  artifacts: Map<string, string>; // artifactKey -> artifactId
  metadata?: Record<string, unknown>;
}

export interface Conflict {
  id: string;
  workspaceId: string;
  artifactKey: string;
  agent1: string;
  agent2: string;
  version1: ArtifactVersion;
  version2: ArtifactVersion;
  detectedAt: string;
  status: 'detected' | 'resolving' | 'resolved' | 'rejected';
  resolution?: {
    strategy: ConflictResolutionStrategy;
    resolvedBy: string;
    resolvedAt: string;
    winningVersion?: number;
    mergedData?: unknown;
    reason?: string;
  };
}

export interface CompliancePackage {
  packageId: string;
  projectId: string;
  workspaceId: string;
  generatedAt: string;
  generatedBy: string;
  artifacts: Array<{
    key: string;
    currentVersion: number;
    versionHistory: ArtifactVersion[];
    feedbackThreads: FeedbackThread[];
  }>;
  summary: {
    totalArtifacts: number;
    totalVersions: number;
    totalFeedback: number;
    criticalFeedback: number;
    blockingFeedback: number;
  };
  signatures: string[];
  metadata?: Record<string, unknown>;
}

export interface WorkspaceMetrics {
  workspaceId: string;
  artifactCount: number;
  versionCount: number;
  feedbackCount: number;
  pendingFeedback: number;
  activeConflicts: number;
  memberCount: number;
  lastActivity: string;
}

export class CollaborativeWorkspace {
  private static instance: CollaborativeWorkspace;
  private workspaces: Map<string, ProjectWorkspace> = new Map();
  private projectWorkspaces: Map<string, Set<string>> = new Map(); // projectId -> workspaceIds
  private conflicts: Map<string, Conflict> = new Map();
  private workspaceConflicts: Map<string, Set<string>> = new Map(); // workspaceId -> conflictIds
  private versioning: ArtifactVersioning;
  private feedback: FeedbackThreads;
  private eventBus: EventBus;

  private constructor() {
    this.versioning = ArtifactVersioning.getInstance();
    this.feedback = FeedbackThreads.getInstance();
    this.eventBus = EventBus.getInstance();
    this.setupEventListeners();
  }

  public static getInstance(): CollaborativeWorkspace {
    if (!CollaborativeWorkspace.instance) {
      CollaborativeWorkspace.instance = new CollaborativeWorkspace();
    }
    return CollaborativeWorkspace.instance;
  }

  private setupEventListeners(): void {
    // Listen for artifact updates to detect conflicts
    this.eventBus.subscribe('artifact:version:updated', (payload) => {
      const version = payload as ArtifactVersion;
      this.checkForConflicts(version);
    });

    // Listen for critical feedback
    this.eventBus.subscribe('feedback:critical', (payload) => {
      const thread = payload as FeedbackThread;
      this.eventBus.publish('workspace:critical_feedback', {
        workspaceId: this.getWorkspaceIdForArtifact(thread.artifactId),
        thread
      });
    });
  }

  /**
   * Create a new project workspace
   */
  public createWorkspace(
    projectId: string,
    name: string,
    createdBy: string,
    options?: {
      description?: string;
      metadata?: Record<string, unknown>;
      initialMembers?: string[];
    }
  ): ProjectWorkspace {
    const workspaceId = `workspace-${projectId}-${Date.now()}`;
    const now = new Date().toISOString();

    const workspace: ProjectWorkspace = {
      id: workspaceId,
      projectId,
      name,
      description: options?.description,
      status: 'active',
      createdAt: now,
      updatedAt: now,
      createdBy,
      members: options?.initialMembers || [createdBy],
      artifacts: new Map(),
      metadata: options?.metadata
    };

    this.workspaces.set(workspaceId, workspace);

    if (!this.projectWorkspaces.has(projectId)) {
      this.projectWorkspaces.set(projectId, new Set());
    }
    this.projectWorkspaces.get(projectId)!.add(workspaceId);

    this.eventBus.publish('workspace:created', workspace);
    logger.info(`[CollaborativeWorkspace] Created workspace ${workspaceId} for project ${projectId}`);

    return workspace;
  }

  /**
   * Get workspace by ID
   */
  public getWorkspace(workspaceId: string): ProjectWorkspace | undefined {
    return this.workspaces.get(workspaceId);
  }

  /**
   * Get all workspaces for a project
   */
  public getWorkspacesForProject(projectId: string): ProjectWorkspace[] {
    const workspaceIds = this.projectWorkspaces.get(projectId);
    if (!workspaceIds) return [];

    return Array.from(workspaceIds)
      .map(id => this.workspaces.get(id))
      .filter((w): w is ProjectWorkspace => w !== undefined);
  }

  /**
   * Get active workspace for project (most recently updated)
   */
  public getActiveWorkspace(projectId: string): ProjectWorkspace | undefined {
    const workspaces = this.getWorkspacesForProject(projectId);
    if (workspaces.length === 0) return undefined;

    return workspaces
      .filter(w => w.status === 'active')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
  }

  /**
   * Update workspace status
   */
  public updateWorkspaceStatus(
    workspaceId: string,
    newStatus: WorkspaceStatus,
    updatedBy: string
  ): ProjectWorkspace | null {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) {
      logger.warn(`[CollaborativeWorkspace] Cannot update non-existent workspace: ${workspaceId}`);
      return null;
    }

    const oldStatus = workspace.status;
    workspace.status = newStatus;
    workspace.updatedAt = new Date().toISOString();

    this.eventBus.publish('workspace:status:changed', {
      workspaceId,
      oldStatus,
      newStatus,
      updatedBy
    });

    logger.info(`[CollaborativeWorkspace] Workspace ${workspaceId} status changed from ${oldStatus} to ${newStatus}`);

    return workspace;
  }

  /**
   * Add member to workspace
   */
  public addMember(workspaceId: string, member: string, addedBy: string): ProjectWorkspace | null {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return null;

    if (!workspace.members.includes(member)) {
      workspace.members.push(member);
      workspace.updatedAt = new Date().toISOString();

      this.eventBus.publish('workspace:member:added', {
        workspaceId,
        member,
        addedBy,
        timestamp: workspace.updatedAt
      });

      logger.debug(`[CollaborativeWorkspace] Added member ${member} to workspace ${workspaceId}`);
    }

    return workspace;
  }

  /**
   * Remove member from workspace
   */
  public removeMember(workspaceId: string, member: string, removedBy: string): ProjectWorkspace | null {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return null;

    const index = workspace.members.indexOf(member);
    if (index > -1) {
      workspace.members.splice(index, 1);
      workspace.updatedAt = new Date().toISOString();

      this.eventBus.publish('workspace:member:removed', {
        workspaceId,
        member,
        removedBy,
        timestamp: workspace.updatedAt
      });

      logger.debug(`[CollaborativeWorkspace] Removed member ${member} from workspace ${workspaceId}`);
    }

    return workspace;
  }

  /**
   * Create or update artifact in workspace with versioning
   */
  public updateArtifact<T>(
    workspaceId: string,
    artifactKey: string,
    data: T,
    source: string,
    author: string,
    options?: {
      changeDescription?: string;
      metadata?: Record<string, unknown>;
    }
  ): ArtifactVersion<T> | null {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) {
      logger.warn(`[CollaborativeWorkspace] Cannot update artifact in non-existent workspace: ${workspaceId}`);
      return null;
    }

    if (workspace.status !== 'active') {
      logger.warn(`[CollaborativeWorkspace] Cannot update artifact in ${workspace.status} workspace: ${workspaceId}`);
      return null;
    }

    const artifactId = workspace.artifacts.get(artifactKey);
    let version: ArtifactVersion<T>;

    if (artifactId) {
      // Update existing
      const result = this.versioning.updateVersion(
        artifactId,
        data,
        source,
        author,
        options?.changeDescription,
        options?.metadata
      );
      if (!result) return null;
      version = result as ArtifactVersion<T>;
    } else {
      // Create new
      const newArtifactId = `${workspaceId}-${artifactKey}`;
      version = this.versioning.createVersion(
        newArtifactId,
        data,
        source,
        author,
        options?.changeDescription,
        options?.metadata
      );
      workspace.artifacts.set(artifactKey, newArtifactId);
    }

    workspace.updatedAt = new Date().toISOString();

    this.eventBus.publish('workspace:artifact:updated', {
      workspaceId,
      artifactKey,
      version: version.version,
      author
    });

    return version;
  }

  /**
   * Get artifact from workspace
   */
  public getArtifact<T>(workspaceId: string, artifactKey: string): T | undefined {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return undefined;

    const artifactId = workspace.artifacts.get(artifactKey);
    if (!artifactId) return undefined;

    const version = this.versioning.getCurrentVersion<T>(artifactId);
    return version?.data;
  }

  /**
   * Get artifact version history
   */
  public getArtifactHistory(workspaceId: string, artifactKey: string): ArtifactVersion[] {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return [];

    const artifactId = workspace.artifacts.get(artifactKey);
    if (!artifactId) return [];

    return this.versioning.getVersionHistory(artifactId);
  }

  /**
   * Rollback artifact to specific version
   */
  public rollbackArtifact<T>(
    workspaceId: string,
    artifactKey: string,
    targetVersion: number,
    author: string,
    reason?: string
  ): ArtifactVersion<T> | null {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return null;

    const artifactId = workspace.artifacts.get(artifactKey);
    if (!artifactId) return null;

    const result = this.versioning.rollbackToVersion<T>(artifactId, targetVersion, author, reason);
    if (result) {
      workspace.updatedAt = new Date().toISOString();
      this.eventBus.publish('workspace:artifact:rollback', {
        workspaceId,
        artifactKey,
        targetVersion,
        author,
        reason
      });
    }

    return result;
  }

  /**
   * Add feedback to artifact
   */
  public addFeedback(
    workspaceId: string,
    artifactKey: string,
    author: string,
    title: string,
    content: string,
    severity: 'nit' | 'blocking' | 'critical',
    options?: {
      location?: { file?: string; line?: number; column?: number };
      tags?: string[];
      metadata?: Record<string, unknown>;
    }
  ): FeedbackThread | null {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return null;

    const artifactId = workspace.artifacts.get(artifactKey);
    if (!artifactId) {
      logger.warn(`[CollaborativeWorkspace] Cannot add feedback to non-existent artifact: ${artifactKey}`);
      return null;
    }

    const thread = this.feedback.createThread(
      artifactId,
      author,
      title,
      content,
      severity,
      options
    );

    workspace.updatedAt = new Date().toISOString();

    this.eventBus.publish('workspace:feedback:added', {
      workspaceId,
      artifactKey,
      threadId: thread.id,
      severity
    });

    return thread;
  }

  /**
   * Get all feedback for artifact
   */
  public getFeedbackForArtifact(workspaceId: string, artifactKey: string): FeedbackThread[] {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return [];

    const artifactId = workspace.artifacts.get(artifactKey);
    if (!artifactId) return [];

    return this.feedback.getThreadsForArtifact(artifactId);
  }

  /**
   * Check if artifact has blocking feedback
   */
  public hasBlockingFeedback(workspaceId: string, artifactKey: string): boolean {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return false;

    const artifactId = workspace.artifacts.get(artifactKey);
    if (!artifactId) return false;

    return this.feedback.hasBlockingFeedback(artifactId);
  }

  /**
   * Check for concurrent edit conflicts
   */
  private checkForConflicts(version: ArtifactVersion): void {
    // Get recent versions of the same artifact (within last 5 minutes)
    const artifactId = version.artifactId;
    const history = this.versioning.getVersionHistory(artifactId);
    const recentVersions = history.filter(v => {
      if (v.id === version.id) return false;
      const timeDiff = new Date(version.timestamp).getTime() - new Date(v.timestamp).getTime();
      return timeDiff < 5 * 60 * 1000 && timeDiff > 0; // Within 5 minutes and earlier
    });

    if (recentVersions.length > 0) {
      // Found potential conflict
      const conflictingVersion = recentVersions[recentVersions.length - 1];
      
      // Get workspace for this artifact
      const workspace = this.findWorkspaceByArtifactId(artifactId);
      if (!workspace) return;

      const conflict: Conflict = {
        id: `conflict-${Date.now()}`,
        workspaceId: workspace.id,
        artifactKey: this.getArtifactKeyById(workspace, artifactId),
        agent1: conflictingVersion.author,
        agent2: version.author,
        version1: conflictingVersion,
        version2: version,
        detectedAt: new Date().toISOString(),
        status: 'detected'
      };

      this.conflicts.set(conflict.id, conflict);

      if (!this.workspaceConflicts.has(workspace.id)) {
        this.workspaceConflicts.set(workspace.id, new Set());
      }
      this.workspaceConflicts.get(workspace.id)!.add(conflict.id);

      this.eventBus.publish('workspace:conflict:detected', conflict);
      logger.warn(`[CollaborativeWorkspace] Conflict detected on artifact ${artifactId} between ${conflictingVersion.author} and ${version.author}`);
    }
  }

  /**
   * Resolve a conflict
   */
  public resolveConflict(
    conflictId: string,
    strategy: ConflictResolutionStrategy,
    resolvedBy: string,
    options?: {
      winningVersion?: number;
      mergedData?: unknown;
      reason?: string;
    }
  ): Conflict | null {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) return null;

    conflict.status = 'resolved';
    conflict.resolution = {
      strategy,
      resolvedBy,
      resolvedAt: new Date().toISOString(),
      winningVersion: options?.winningVersion,
      mergedData: options?.mergedData,
      reason: options?.reason
    };

    this.eventBus.publish('workspace:conflict:resolved', conflict);
    logger.info(`[CollaborativeWorkspace] Conflict ${conflictId} resolved with strategy: ${strategy}`);

    return conflict;
  }

  /**
   * Get conflicts for workspace
   */
  public getConflictsForWorkspace(workspaceId: string): Conflict[] {
    const conflictIds = this.workspaceConflicts.get(workspaceId);
    if (!conflictIds) return [];

    return Array.from(conflictIds)
      .map(id => this.conflicts.get(id))
      .filter((c): c is Conflict => c !== undefined);
  }

  /**
   * Get active conflicts
   */
  public getActiveConflicts(): Conflict[] {
    return Array.from(this.conflicts.values())
      .filter(c => c.status === 'detected' || c.status === 'resolving');
  }

  /**
   * Generate compliance package
   */
  public generateCompliancePackage(
    workspaceId: string,
    generatedBy: string
  ): CompliancePackage | null {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return null;

    const artifacts: CompliancePackage['artifacts'] = [];
    let totalVersions = 0;
    let totalFeedback = 0;
    let criticalFeedback = 0;
    let blockingFeedback = 0;

    for (const [key, artifactId] of workspace.artifacts) {
      const versionHistory = this.versioning.getVersionHistory(artifactId);
      const feedbackThreads = this.feedback.getThreadsForArtifact(artifactId);

      const currentVersion = this.versioning.getCurrentVersionNumber(artifactId);

      artifacts.push({
        key,
        currentVersion,
        versionHistory,
        feedbackThreads
      });

      totalVersions += versionHistory.length;
      totalFeedback += feedbackThreads.length;
      criticalFeedback += feedbackThreads.filter(t => t.severity === 'critical').length;
      blockingFeedback += feedbackThreads.filter(t => t.severity === 'blocking').length;
    }

    const packageId = `compliance-${workspaceId}-${Date.now()}`;

    const pkg: CompliancePackage = {
      packageId,
      projectId: workspace.projectId,
      workspaceId,
      generatedAt: new Date().toISOString(),
      generatedBy,
      artifacts,
      summary: {
        totalArtifacts: artifacts.length,
        totalVersions,
        totalFeedback,
        criticalFeedback,
        blockingFeedback
      },
      signatures: []
    };

    this.eventBus.publish('workspace:compliance:package_generated', pkg);
    logger.info(`[CollaborativeWorkspace] Generated compliance package ${packageId} with ${artifacts.length} artifacts`);

    return pkg;
  }

  /**
   * Sign compliance package
   */
  public signCompliancePackage(packageId: string, signer: string, signature: string): boolean {
    // In a real implementation, this would verify the signature cryptographically
    this.eventBus.publish('workspace:compliance:package_signed', {
      packageId,
      signer,
      signature,
      timestamp: new Date().toISOString()
    });

    logger.info(`[CollaborativeWorkspace] Compliance package ${packageId} signed by ${signer}`);
    return true;
  }

  /**
   * Get workspace metrics
   */
  public getMetrics(workspaceId: string): WorkspaceMetrics | null {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return null;

    let versionCount = 0;
    let feedbackCount = 0;

    for (const [, artifactId] of workspace.artifacts) {
      versionCount += this.versioning.getVersionHistory(artifactId).length;
      feedbackCount += this.feedback.getThreadsForArtifact(artifactId).length;
    }

    const activeConflicts = this.getConflictsForWorkspace(workspaceId)
      .filter(c => c.status === 'detected' || c.status === 'resolving').length;

    const pendingFeedback = this.feedback.filterThreads({ status: 'pending' })
      .filter(t => {
        const artifactWorkspace = this.findWorkspaceByArtifactId(t.artifactId);
        return artifactWorkspace?.id === workspaceId;
      }).length;

    return {
      workspaceId,
      artifactCount: workspace.artifacts.size,
      versionCount,
      feedbackCount,
      pendingFeedback,
      activeConflicts,
      memberCount: workspace.members.length,
      lastActivity: workspace.updatedAt
    };
  }

  /**
   * Export workspace data
   */
  public exportWorkspace(workspaceId: string): string {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return '{}';

    const exportData = {
      workspace,
      artifacts: {} as Record<string, ArtifactVersion[]>,
      feedback: {} as Record<string, FeedbackThread[]>,
      conflicts: this.getConflictsForWorkspace(workspaceId),
      metrics: this.getMetrics(workspaceId),
      exportedAt: new Date().toISOString()
    };

    for (const [key, artifactId] of workspace.artifacts) {
      exportData.artifacts[key] = this.versioning.getVersionHistory(artifactId);
      exportData.feedback[key] = this.feedback.getThreadsForArtifact(artifactId);
    }

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Archive workspace
   */
  public archiveWorkspace(workspaceId: string, archivedBy: string, reason?: string): ProjectWorkspace | null {
    const workspace = this.updateWorkspaceStatus(workspaceId, 'archived', archivedBy);
    if (workspace) {
      this.eventBus.publish('workspace:archived', {
        workspaceId,
        archivedBy,
        reason,
        timestamp: new Date().toISOString()
      });
      logger.info(`[CollaborativeWorkspace] Workspace ${workspaceId} archived by ${archivedBy}`);
    }
    return workspace;
  }

  /**
   * Delete workspace
   */
  public deleteWorkspace(workspaceId: string, deletedBy: string, reason?: string): boolean {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return false;

    // Remove from project index
    const projectWorkspaces = this.projectWorkspaces.get(workspace.projectId);
    if (projectWorkspaces) {
      projectWorkspaces.delete(workspaceId);
    }

    // Clean up conflicts
    const conflicts = this.workspaceConflicts.get(workspaceId);
    if (conflicts) {
      for (const conflictId of conflicts) {
        this.conflicts.delete(conflictId);
      }
      this.workspaceConflicts.delete(workspaceId);
    }

    this.workspaces.delete(workspaceId);

    this.eventBus.publish('workspace:deleted', {
      workspaceId,
      projectId: workspace.projectId,
      deletedBy,
      reason,
      timestamp: new Date().toISOString()
    });

    logger.info(`[CollaborativeWorkspace] Workspace ${workspaceId} deleted by ${deletedBy}`);
    return true;
  }

  /**
   * Get all workspaces
   */
  public getAllWorkspaces(): ProjectWorkspace[] {
    return Array.from(this.workspaces.values());
  }

  /**
   * Get workspace ID for artifact (helper)
   */
  private getWorkspaceIdForArtifact(artifactId: string): string | undefined {
    const workspace = this.findWorkspaceByArtifactId(artifactId);
    return workspace?.id;
  }

  /**
   * Find workspace by artifact ID
   */
  private findWorkspaceByArtifactId(artifactId: string): ProjectWorkspace | undefined {
    for (const workspace of this.workspaces.values()) {
      for (const [, id] of workspace.artifacts) {
        if (id === artifactId) {
          return workspace;
        }
      }
    }
    return undefined;
  }

  /**
   * Get artifact key from artifact ID
   */
  private getArtifactKeyById(workspace: ProjectWorkspace, artifactId: string): string {
    for (const [key, id] of workspace.artifacts) {
      if (id === artifactId) return key;
    }
    return artifactId;
  }
}

export default CollaborativeWorkspace;
