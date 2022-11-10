import { ChangeEvent, ChangeListener } from "./types.js";

/**
 * @public
 */
export default class ChangeEmitter {
  static ID = 0;

  id = ++ChangeEmitter.ID;
  muted = false;

  #listeners: {
    once: boolean;
    fn: ChangeListener;
    caller: unknown;
  }[];

  constructor() {
    this.#listeners = [];
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

  getListenerCount() {
    return this.#listeners.length;
  }

  mute(muted: boolean) {
    this.muted = muted;
  }

  dispatch(event: ChangeEvent) {
    if (this.muted) return;

    const start = this.#listeners.length - 1;

    for (let index = start; index >= 0; index--) {
      const listener = this.#listeners[index];
      listener.fn.call(listener.caller, event);
      if (listener.once) {
        this.off(listener.fn);
      }
    }
  }
}
