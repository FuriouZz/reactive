import type { Callable } from "./types.js";

/**
 * This class tracks signal access, means a get() call, and subscribe to the signal
 * @public
 */
export default class Effect {
  trigger: Callable;
  _disposed: boolean;
  _isTrackingDependencies: boolean;

  constructor(effect: Callable) {
    this._disposed = false;
    this._isTrackingDependencies = true;

    this.trigger = () => {
      if (this._disposed) return;
      try {
        Effect.push(this);
        effect();
      } finally {
        Effect.pop();
      }
    };
  }

  /**
   * Track dependencies
   */
  track() {
    this._isTrackingDependencies = true;
  }

  /**
   * Stop tracking dependencies
   */
  untrack() {
    this._isTrackingDependencies = false;
  }

  /**
   * Stop listening signals
   */
  dispose() {
    this._disposed = true;
  }

  static get Current(): Effect | undefined {
    const current = Effect.effects[Effect.effects.length - 1];
    if (current?._isTrackingDependencies) return current;
    return undefined;
  }

  static effects: Effect[] = [];

  static push(context: Effect) {
    Effect.effects.push(context);
  }

  static pop() {
    Effect.effects.pop();
  }
}
