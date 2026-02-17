/**
 * Event Bus for Inter-Agent Communication
 */

import { v4 as uuidv4 } from 'uuid';
import { CoworkConfigManager } from 'src/cowork/config/cowork-config-manager';
import { PostgresPersistenceManager } from 'src/cowork/persistence/postgres-persistence-manager';
import { CoworkEventRecord } from 'src/cowork/persistence/types';

export type EventCallback = (payload: unknown, event?: CoworkEventRecord) => void | Promise<void>;

export class EventBus {
  private static instance: EventBus;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private persistenceManager: PostgresPersistenceManager | null = null;
  private tenantId: string;

  private constructor() {
    this.tenantId = CoworkConfigManager.getInstance().getPersistenceConfig().tenantId;
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public async configurePersistence(persistenceManager: PostgresPersistenceManager): Promise<void> {
    this.persistenceManager = persistenceManager;
    await this.persistenceManager.initialize();
  }

  public async publish(event: string, payload: unknown, metadata?: Record<string, unknown>): Promise<void> {
    let persistedEvent: CoworkEventRecord | undefined;

    if (this.persistenceManager) {
      persistedEvent = {
        eventId: uuidv4(),
        tenantId: this.tenantId,
        aggregateId: (metadata?.aggregateId as string) || event,
        aggregateType: (metadata?.aggregateType as string) || 'event',
        type: event,
        payload,
        metadata: metadata || {},
        version: Number(metadata?.version || 1),
        occurredAt: new Date().toISOString()
      };

      await this.persistenceManager.appendEvent(persistedEvent);
    }

    const callbacks = this.getCallbacksForEvent(event);
    for (const callback of callbacks) {
      await callback(payload, persistedEvent);
    }

    if (persistedEvent && this.persistenceManager) {
      await this.persistenceManager.markEventDelivered(persistedEvent.eventId);
    }
  }

  public subscribe(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  public unsubscribe(event: string, callback: EventCallback): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  public async replayUndeliveredEvents(limit = 100): Promise<number> {
    if (!this.persistenceManager) {
      return 0;
    }

    const events = await this.persistenceManager.listUndeliveredEvents(limit);
    for (const event of events) {
      const callbacks = this.getCallbacksForEvent(event.type);
      for (const callback of callbacks) {
        await callback(event.payload, event);
      }
      await this.persistenceManager.markEventDelivered(event.eventId);
    }

    return events.length;
  }

  private getCallbacksForEvent(eventName: string): EventCallback[] {
    const direct = this.listeners.get(eventName) || new Set<EventCallback>();
    const wildcard = this.listeners.get('*') || new Set<EventCallback>();
    return [...direct, ...wildcard];
  }
}
