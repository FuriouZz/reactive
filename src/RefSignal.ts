import Signal from "./Signal.js";
import { SignalOptions } from "./types.js";

/**
 * Wrap object field into a Signal
 * @public
 */
export default class RefSignal<
  T extends object,
  K extends keyof T
> extends Signal<T[K]> {
  target: T;
  key: K;
  receiver: any;

  constructor(
    target: T,
    key: K,
    receiver?: any,
    options?: SignalOptions<T[K]>
  ) {
    super(Reflect.get(target, key), options);
    this.target = target;
    this.key = key;
    this.receiver = receiver;
  }

  get rawValue() {
    return Reflect.get(this.target, this.key, this.receiver);
  }

  set rawValue(v) {
    Reflect.set(this.target, this.key, v, this.receiver);
  }
}
