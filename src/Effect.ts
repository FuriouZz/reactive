import { getRootScope } from "./RootScope.js";
import type { Callable } from "./types.js";

/**
 * This class tracks signal access, means a get() call, and subscribe to the signal
 * @public
 */
export default class Effect {
  trigger: Callable | null;
  _disposed: boolean;
  _isTrackingDependencies: boolean;

  constructor(effect: Callable) {
    this._disposed = false;
    this._isTrackingDependencies = true;

    this.trigger = () => {
      if (this._disposed) return;
      getRootScope()?.runEffect(this, effect);
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
    this.trigger = null;
  }
}
