import { createMemo, createSignal } from "./signal.js";
import { WriteStream, ReadStream } from "./types.js";

/**
 * @public
 */
export function createWriteStream<Source>(
  defaultValue: Source
): WriteStream<Source, Source>;

/**
 * @public
 */
export function createWriteStream<Source, Result = Source>(
  defaultValue: Source,
  transform: (source: Source) => Result
): WriteStream<Source, Result>;

/**
 * @public
 */
export function createWriteStream<Source, Result = Source>(
  defaultValue: Source,
  transform?: (source: Source) => Result
): WriteStream<Source, Result> {
  const [_read, _write] = createSignal<Source | Result>(defaultValue);

  const write = (source: Source) => {
    if (transform) {
      _write(transform(source));
    } else {
      _write(source);
    }
  };

  const pipe = <Output>(transform: (source: Result) => Output) => {
    return createReadStream<Result, Output>(_read as () => Result, transform);
  };

  return { write, pipe };
}

/**
 * @public
 */
export function createReadStream<Source>(
  source: () => Source
): ReadStream<Source, Source>;

/**
 * @public
 */
export function createReadStream<Source, Result = Source>(
  source: () => Source,
  transform: (source: Source) => Result
): ReadStream<Source, Result>;

/**
 * @public
 */
export function createReadStream<Source, Result = Source>(
  source: () => Source,
  transform?: (source: Source) => Result
): ReadStream<Source, Result> {
  const read = createMemo(() => {
    const value = source();
    if (transform) {
      return transform(value);
    }
    return value as unknown as Result;
  });

  const pipe = <Output>(transform: (source: Result) => Output) => {
    return createReadStream<Result, Output>(read as () => Result, transform);
  };

  return { read, pipe };
}
