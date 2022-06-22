import { ChangeEvent } from "./types";

/**
 * @public
 */
 export type ChangeListener = (event: ChangeEvent) => void;

/**
 * @public
 */
export type FilterCallback = (event: ChangeEvent) => boolean;

/**
 * @public
 */
export default class ChangeEmitter {
  muted = false;

  #listeners: {
    once: boolean;
    fn: ChangeListener;
    caller: unknown;
    filter?: FilterCallback;
  }[];

  expose: {
    on: (listener: ChangeListener, caller?: unknown) => () => void;
    off: (listener: ChangeListener) => void;
    once: (listener: ChangeListener, caller?: object) => () => void;
    filter: (listener: ChangeListener, filter: FilterCallback) => void;
    removeListeners: () => void;
  };

  constructor() {
    this.#listeners = [];
    this.expose = {
      on: this.on.bind(this),
      off: this.off.bind(this),
      once: this.once.bind(this),
      removeListeners: this.removeListeners.bind(this),
      filter: this.filter.bind(this),
    };
  }

  on(listener: ChangeListener, caller?: unknown) {
    this.#listeners.push({ once: false, fn: listener, caller });
    return () => this.off(listener);
  }

  once(listener: ChangeListener, caller?: object) {
    this.#listeners.push({ once: true, fn: listener, caller });
    return () => this.off(listener);
  }

  off(listener: ChangeListener) {
    const index = this.#listeners.findIndex((l) => l.fn === listener);
    if (index === -1) return;
    this.#listeners.splice(index, 1);
  }

  removeListeners() {
    const listeners = this.#listeners.slice(0);
    for (const listener of listeners) {
      this.off(listener.fn);
    }
  }

  filter(listener: ChangeListener, filter: FilterCallback) {
    const l = this.#listeners.find((l) => l.fn === listener);
    if (l) l.filter = filter;
  }

  dispatch(event: ChangeEvent) {
    if (this.muted) return;

    const listeners = this.#listeners
      .slice(0)
      .filter(({ filter }) => !filter || filter(event));

    for (const listener of listeners) {
      listener.fn.call(listener.caller, event);
      if (listener.once) {
        this.off(listener.fn);
      }
    }
  }
}
