import { Dispatcher as D } from "@furiouzz/lol";

export default class Dispatcher<T> extends D<T> {
  muted = false;

  dispatch(value: T): void {
    if (this.muted) return;
    super.dispatch(value);
  }
}
