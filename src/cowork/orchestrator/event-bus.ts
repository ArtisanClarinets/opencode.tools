/**
 * Event Bus for Inter-Agent Communication
 */

import { logger } from '../../runtime/logger';
import { isSafeEventName, sanitizeEventPayload } from '../../security/event-guardrails';

export type EventCallback = (payload: unknown) => void | Promise<void>;

export class EventBus {
  private static instance: EventBus;
  private listeners: Map<string, Set<EventCallback>> = new Map();

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public publish(event: string, payload: unknown): void {
    if (!isSafeEventName(event)) {
      logger.warn('[EventBus] Rejected unsafe event name', { event });
      return;
    }

    const sanitizedPayload = sanitizeEventPayload(payload);
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          const result = callback(sanitizedPayload);
          if (result instanceof Promise) {
            result.catch((err) => logger.error(`[EventBus] Error in async listener for ${event}`, err));
          }
        } catch (err: unknown) {
          logger.error(`[EventBus] Error in listener for ${event}`, err);
        }
      });
    }
  }

  public subscribe(event: string, callback: EventCallback): () => void {
    if (!isSafeEventName(event)) {
      logger.warn('[EventBus] Rejected subscribe to unsafe event name', { event });
      return () => undefined;
    }

    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.unsubscribe(event, callback);
    };
  }

  public unsubscribe(event: string, callback: EventCallback): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  public listenerCount(event: string): number {
    return this.listeners.get(event)?.size ?? 0;
  }
}
