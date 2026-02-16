/**
 * Task Router Tests
 */

import { TaskRouter, QueuedTask, QueueStatus } from '../../../../src/cowork/routing/task-router';
import { CapabilityMatcher } from '../../../../src/cowork/routing/capability-matcher';
import { TeamManager } from '../../../../src/cowork/team/team-manager';
import { EventBus } from '../../../../src/cowork/orchestrator/event-bus';
import { CollaborationProtocol } from '../../../../src/cowork/team/collaboration-protocol';

// Mock dependencies
jest.mock('../../../../src/cowork/routing/capability-matcher', () => ({
  CapabilityMatcher: {
    getInstance: jest.fn(() => ({
      parseTaskCapabilities: jest.fn((desc: string) => {
        if (desc.includes('frontend')) return ['frontend'];
        if (desc.includes('backend')) return ['backend'];
        return [];
      }),
      calculateMatchScore: jest.fn(() => 80),
      matchTaskToAgents: jest.fn(() => [{
        agentId: 'agent-1',
        roleId: 'dev-1',
        score: 80,
        matchedCapabilities: ['frontend'],
        missingCapabilities: [],
        reason: 'Good match'
      }])
    }))
  }
}));

jest.mock('../../../../src/cowork/team/team-manager', () => ({
  TeamManager: {
    getInstance: jest.fn(() => ({
      listActiveTeams: jest.fn(() => [{
        id: 'team-1',
        members: new Map([
          ['agent-1', {
            agentId: 'agent-1',
            roleId: 'dev-1',
            name: 'Developer',
            status: 'idle',
            capabilities: ['frontend']
          }]
        ])
      }])
    }))
  }
}));

jest.mock('../../../../src/cowork/orchestrator/event-bus', () => ({
  EventBus: {
    getInstance: jest.fn(() => ({
      publish: jest.fn()
    }))
  }
}));

jest.mock('../../../../src/cowork/team/collaboration-protocol', () => ({
  CollaborationProtocol: {
    getInstance: jest.fn(() => ({
      escalate: jest.fn()
    }))
  }
}));

describe('TaskRouter', () => {
  let router: TaskRouter;
  let mockEventBus: { publish: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    mockEventBus = {
      publish: jest.fn()
    };
    (EventBus.getInstance as jest.Mock).mockReturnValue(mockEventBus);

    TaskRouter['instance'] = undefined as unknown as TaskRouter;
    router = TaskRouter.getInstance();
  });

  afterEach(() => {
    jest.useRealTimers();
    router.clear();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = TaskRouter.getInstance();
      const instance2 = TaskRouter.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('submitTask', () => {
    it('should submit a task and return queued task', () => {
      const task = router.submitTask({
        taskId: 'task-1',
        description: 'Build frontend component',
        requiredCapabilities: ['frontend'],
        priority: 'medium',
        estimatedEffort: 'small'
      });

      expect(task).toBeDefined();
      expect(task.taskId).toBe('task-1');
      expect(task.status).toBe('assigned'); // Auto-assigned
      expect(task.priority).toBeGreaterThan(0);
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'task:submitted',
        expect.any(Object)
      );
    });

    it('should calculate priority based on task properties', () => {
      const criticalTask = router.submitTask({
        taskId: 'task-critical',
        description: 'Build frontend',
        requiredCapabilities: ['frontend'],
        priority: 'critical',
        estimatedEffort: 'large'
      });

      const lowTask = router.submitTask({
        taskId: 'task-low',
        description: 'Build frontend',
        requiredCapabilities: ['frontend'],
        priority: 'low',
        estimatedEffort: 'small'
      });

      expect(criticalTask.priority).toBeGreaterThan(lowTask.priority);
    });

    it('should set deadline if provided', () => {
      const deadline = Date.now() + 24 * 60 * 60 * 1000;
      const task = router.submitTask({
        taskId: 'task-1',
        description: 'Build frontend',
        requiredCapabilities: ['frontend'],
        priority: 'medium',
        estimatedEffort: 'small',
        deadline
      });

      expect(task.deadline).toBe(deadline);
    });
  });

  describe('assignTask', () => {
    it('should assign task to specified agent', () => {
      const task = router.submitTask({
        taskId: 'task-1',
        description: 'Build frontend',
        requiredCapabilities: ['frontend'],
        priority: 'medium',
        estimatedEffort: 'small'
      });

      // Reset to queued for manual assignment test
      const taskFromRouter = router.getTask(task.id);
      if (taskFromRouter) {
        taskFromRouter.status = 'queued';
        taskFromRouter.assignedAgentId = undefined;
      }

      const success = router.assignTask(task.id, 'agent-1');

      expect(success).toBe(true);
      expect(taskFromRouter?.status).toBe('assigned');
      expect(taskFromRouter?.assignedAgentId).toBe('agent-1');
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'task:assigned',
        expect.any(Object)
      );
    });

    it('should return false for non-existent task', () => {
      const success = router.assignTask('non-existent', 'agent-1');
      expect(success).toBe(false);
    });

    it('should auto-assign if no agent specified', () => {
      const task = router.submitTask({
        taskId: 'task-1',
        description: 'Build frontend',
        requiredCapabilities: ['frontend'],
        priority: 'medium',
        estimatedEffort: 'small'
      });

      // Reset to queued
      const taskFromRouter = router.getTask(task.id);
      if (taskFromRouter) {
        taskFromRouter.status = 'queued';
        taskFromRouter.assignedAgentId = undefined;
      }

      const success = router.assignTask(task.id);

      expect(success).toBe(true);
      expect(taskFromRouter?.assignedAgentId).toBeDefined();
    });
  });

  describe('getNextTaskForAgent', () => {
    it('should return highest priority task for agent', () => {
      // Submit multiple tasks
      const task1 = router.submitTask({
        taskId: 'low-priority-task',
        description: 'Build frontend',
        requiredCapabilities: ['frontend'],
        priority: 'low',
        estimatedEffort: 'small'
      });

      const task2 = router.submitTask({
        taskId: 'high-priority-task',
        description: 'Build frontend',
        requiredCapabilities: ['frontend'],
        priority: 'critical',
        estimatedEffort: 'small'
      });

      // Reset both to queued
      const t1 = router.getTask(task1.id);
      const t2 = router.getTask(task2.id);
      if (t1) {
        t1.status = 'queued';
        t1.assignedAgentId = undefined;
      }
      if (t2) {
        t2.status = 'queued';
        t2.assignedAgentId = undefined;
      }

      const nextTask = router.getNextTaskForAgent('agent-1');

      expect(nextTask).toBeDefined();
      expect(nextTask?.taskId).toBe('high-priority-task');
    });

    it('should return undefined if no matching tasks', () => {
      const task = router.getNextTaskForAgent('non-existent-agent');
      expect(task).toBeUndefined();
    });
  });

  describe('completeTask', () => {
    it('should mark task as completed', () => {
      const task = router.submitTask({
        taskId: 'task-1',
        description: 'Build frontend',
        requiredCapabilities: ['frontend'],
        priority: 'medium',
        estimatedEffort: 'small'
      });

      const result = { success: true, data: 'done' };
      router.completeTask(task.id, result);

      const completedTask = router.getTask(task.id);
      expect(completedTask?.status).toBe('completed');
      expect(completedTask?.result).toEqual(result);
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'task:completed',
        expect.objectContaining({ taskId: task.id })
      );
    });
  });

  describe('failTask', () => {
    it('should retry task on failure if retries remain', () => {
      const task = router.submitTask({
        taskId: 'task-1',
        description: 'Build frontend',
        requiredCapabilities: ['frontend'],
        priority: 'medium',
        estimatedEffort: 'small'
      });

      router.failTask(task.id, 'Something went wrong');

      const failedTask = router.getTask(task.id);
      expect(failedTask?.status).toBe('queued'); // Retrying
      expect(failedTask?.retryCount).toBe(1);
      expect(failedTask?.error).toBe('Something went wrong');
    });

    it('should mark task as failed after max retries', () => {
      const task = router.submitTask({
        taskId: 'task-1',
        description: 'Build frontend',
        requiredCapabilities: ['frontend'],
        priority: 'medium',
        estimatedEffort: 'small'
      });

      // Set max retries reached
      const taskFromRouter = router.getTask(task.id);
      if (taskFromRouter) {
        taskFromRouter.retryCount = 3;
        taskFromRouter.maxRetries = 3;
      }

      router.failTask(task.id, 'Final error');

      const failedTask = router.getTask(task.id);
      expect(failedTask?.status).toBe('failed');
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'task:failed',
        expect.any(Object)
      );
    });
  });

  describe('retryTask', () => {
    it('should schedule retry with exponential backoff', () => {
      const task = router.submitTask({
        taskId: 'task-1',
        description: 'Build frontend',
        requiredCapabilities: ['frontend'],
        priority: 'medium',
        estimatedEffort: 'small'
      });

      // Set to failed first
      const taskFromRouter = router.getTask(task.id);
      if (taskFromRouter) {
        taskFromRouter.status = 'failed';
        taskFromRouter.retryCount = 0;
      }

      const success = router.retryTask(task.id);

      expect(success).toBe(true);
      expect(taskFromRouter?.retryCount).toBe(1);
      expect(taskFromRouter?.status).toBe('queued');
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'task:retry_scheduled',
        expect.any(Object)
      );
    });

    it('should return false if max retries exceeded', () => {
      const task = router.submitTask({
        taskId: 'task-1',
        description: 'Build frontend',
        requiredCapabilities: ['frontend'],
        priority: 'medium',
        estimatedEffort: 'small'
      });

      const taskFromRouter = router.getTask(task.id);
      if (taskFromRouter) {
        taskFromRouter.retryCount = 3;
        taskFromRouter.maxRetries = 3;
      }

      const success = router.retryTask(task.id);

      expect(success).toBe(false);
    });
  });

  describe('getQueueStatus', () => {
    it('should return current queue status', () => {
      // Submit tasks
      router.submitTask({
        taskId: 'task-1',
        description: 'Build frontend',
        requiredCapabilities: ['frontend'],
        priority: 'medium',
        estimatedEffort: 'small'
      });

      const status = router.getQueueStatus();

      expect(status.totalTasks).toBeGreaterThan(0);
      expect(status).toHaveProperty('queued');
      expect(status).toHaveProperty('inProgress');
      expect(status).toHaveProperty('completed');
      expect(status).toHaveProperty('failed');
      expect(status).toHaveProperty('averageWaitTime');
    });
  });

  describe('setTaskPriority', () => {
    it('should update task priority', () => {
      const task = router.submitTask({
        taskId: 'task-1',
        description: 'Build frontend',
        requiredCapabilities: ['frontend'],
        priority: 'low',
        estimatedEffort: 'small'
      });

      const originalPriority = task.priority;
      const success = router.setTaskPriority(task.id, 90);

      expect(success).toBe(true);
      expect(router.getTask(task.id)?.priority).toBe(90);
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'task:priority_changed',
        expect.any(Object)
      );
    });

    it('should clamp priority to valid range', () => {
      const task = router.submitTask({
        taskId: 'task-1',
        description: 'Build frontend',
        requiredCapabilities: ['frontend'],
        priority: 'medium',
        estimatedEffort: 'small'
      });

      router.setTaskPriority(task.id, 150); // Above max
      expect(router.getTask(task.id)?.priority).toBe(100);

      router.setTaskPriority(task.id, -10); // Below min
      expect(router.getTask(task.id)?.priority).toBe(1);
    });
  });

  describe('handleAgentFailure', () => {
    it('should reassign tasks from failed agent', () => {
      // Submit and assign task
      const task = router.submitTask({
        taskId: 'task-1',
        description: 'Build frontend',
        requiredCapabilities: ['frontend'],
        priority: 'medium',
        estimatedEffort: 'small'
      });

      // Manually assign to specific agent
      router.assignTask(task.id, 'failing-agent');

      // Handle failure
      router.handleAgentFailure('failing-agent');

      const reassignedTask = router.getTask(task.id);
      expect(reassignedTask?.status).toBe('queued');
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'task:agent_failure_handled',
        expect.any(Object)
      );
    });
  });

  describe('getAllTasks', () => {
    it('should return all tasks', () => {
      router.submitTask({
        taskId: 'task-1',
        description: 'Build frontend',
        requiredCapabilities: ['frontend'],
        priority: 'medium',
        estimatedEffort: 'small'
      });

      router.submitTask({
        taskId: 'task-2',
        description: 'Build backend',
        requiredCapabilities: ['backend'],
        priority: 'medium',
        estimatedEffort: 'small'
      });

      const tasks = router.getAllTasks();

      expect(tasks.length).toBe(2);
    });
  });

  describe('clear', () => {
    it('should clear all tasks', () => {
      router.submitTask({
        taskId: 'task-1',
        description: 'Build frontend',
        requiredCapabilities: ['frontend'],
        priority: 'medium',
        estimatedEffort: 'small'
      });

      expect(router.getAllTasks().length).toBe(1);

      router.clear();

      expect(router.getAllTasks().length).toBe(0);
    });
  });
});
