import { computed, watch } from "./reactive/index.js";
import { Computed, Ref } from "./reactive/types.js";
import { createEffect } from "./signal/signal.js";
import { createWriteStream } from "./signal/stream.js";

export function signalToComputed<T>(signal: [() => T, (value: T) => void]) {
  const [get, set] = signal;
  const c = computed(get, set);
  createEffect(() => {
    get();
    c.$invalidate();
  });
  return c;
}

export function computedToSignal<T>(c: Computed<T, T> | Ref<T>) {
  let isWriting = false;

  const { write, pipe } = createWriteStream<T>(c.value as T, (value) => {
    isWriting = true;
    // @ts-ignore
    c.value = value;
    isWriting = false;
    return value;
  });

  const { read } = pipe((source) => source);

  watch(
    [c],
    ([c]) => {
      if (!isWriting) {
        write(c);
      }
    },
    { immediate: true }
  );

  return [read, write] as [() => T, (value: T) => void];
}
