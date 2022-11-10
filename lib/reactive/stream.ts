import { computedToSignal } from "../conversion.js";
import { createReadStream } from "../signal/stream.js";
import { Computed, Ref, Stream } from "./types.js";
import { ReadStream } from "../signal/types.js";
import { createEffect } from "../signal/signal.js";
import { ref } from "./ref.js";

/**
 * @public
 */
export const stream = <T>(c: Computed<T> | Ref<T>) => {
  const [read] = computedToSignal(c);

  const readable = createReadStream(read);

  const createPipe = <Source, Result>(
    stream: ReadStream<Source, Result>
  ): Stream<Source, Result> => {
    let box: Ref<Result> | undefined = undefined;

    const getOrCreateRef = () => {
      if (box) return box;

      box = ref<Result>(undefined!);

      createEffect(() => {
        const value = stream.read();
        // @ts-ignore
        if (box) box.value = value;
      });

      return box;
    };

    return {
      pipe<Output>(transform?: ((source: Result) => Output) | undefined) {
        const child = stream.pipe(transform);
        return createPipe(child);
      },
      ref: getOrCreateRef,
    };
  };

  return createPipe(readable);
};
