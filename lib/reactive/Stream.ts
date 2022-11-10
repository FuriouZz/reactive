import { computed } from "./computed.js";
import { watch } from "./helpers.js";
import { internalObservable } from "./internals.js";
import { Computed, InlineWatchSourceTuple, WatchSource } from "./types.js";

/**
 * @public
 */
export default class Stream<Source, Result = Source> {
  #transform?: (value: Source) => Result;
  #pipes: Stream<Result, any>[];
  #result?: Result;
  #computed: Computed<Result, Source>;

  constructor(transform?: (value: Source) => Result) {
    this.#transform = transform;
    this.#pipes = [];
    this.#computed = computed(() => this.#result!);
  }

  pipe<Output>(transform: (value: Result) => Output) {
    const pipe = new Stream<Result, Output>(transform);
    if (this.#result) pipe.run(this.#result);
    this.#pipes.push(pipe);
    return pipe;
  }

  ref() {
    return this.#computed;
  }

  run(source: Source) {
    const oldValue = this.#result;
    const result = (
      this.#transform ? this.#transform(source) : source
    ) as Result;

    for (const pipe of this.#pipes) {
      pipe.run(result);
    }

    this.#result = result;

    const internal = internalObservable<{ value: Result }>(this.#computed);
    if (internal) {
      internal.target.value = result;
      internal.change.dispatch({ key: "value", newValue: result, oldValue });
    }

    return result;
  }
}

/**
 * @public
 */
export const stream = <T extends WatchSource[]>(values: [...T]) => {
  const stream = new Stream<InlineWatchSourceTuple<T>>();

  watch(
    values,
    (values) => {
      stream.run(values);
    },
    { immediate: true }
  );

  return stream;
};
