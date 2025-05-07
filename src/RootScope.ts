import BatchScope from "./BatchScope";
import type Effect from "./Effect";
import type { Callable, ExposedScope } from "./types";

const roots: RootScope[] = [];
const push = (root: RootScope) => roots.push(root);
const pop = () => roots.pop();

let defaultScope: RootScope | undefined;

/**
 * @public
 */
export function getRootScope(): RootScope | undefined {
  let scope = roots[roots.length - 1] ?? defaultScope;
  if (!scope && !defaultScope) {
    scope = defaultScope = new RootScope();
  }
  return scope;
}

/**
 * @public
 */
export default class RootScope {
  private _effects: Effect[] = [];
  private _scopes: BatchScope[] = [];
  private _registeredEffect = new Set<Effect>();

  constructor() {
    push(this);
  }

  getCurrentBatchScope(): BatchScope | undefined {
    return this._scopes[this._scopes.length - 1];
  }

  getCurrentEffect() {
    const current = this._effects[this._effects.length - 1];
    if (current?._isTrackingDependencies) return current;
    return undefined;
  }

  runEffect(effect: Effect, callable: Callable) {
    try {
      this._effects.push(effect);
      this._registeredEffect.add(effect);
      callable();
    } finally {
      this._effects.pop();
    }
  }

  /**
   * Run scope with the given context
   * @param scope
   * @param scope
   */
  batch<T>(
    callback: (this: ExposedScope, context: ExposedScope) => T,
  ) {
    const scope = new BatchScope();
    let result: T;

    try {
      this._scopes.push(scope);
      const exposed = {
        trigger: (action?: "update" | "sideEffects") => scope.trigger(action),
      };
      result = callback.call(exposed, exposed);
    } finally {
      this._scopes.pop();
    }

    scope.trigger();
    return result;
  }

  dispose() {
    for (const effect of this._registeredEffect) {
      effect.dispose();
    }
    pop();
  }
}
