import {
  createObservable,
  createObservableDeeply,
  CreateObservableOptions,
  Observable,
} from "./observable";

const items: [Observable<any>, string][] = [];
let listening = false;

function registerWatch(p: Observable<any>, key: string) {
  if (!listening) return;
  items.push([p, key]);
}

export const watchable = <T extends object>(
  target: T,
  options: { deep?: boolean } & Pick<CreateObservableOptions<T>, "compare"> = {}
) => {
  const opts: CreateObservableOptions<T> = {
    target,
    get(target, key) {
      registerWatch(o as any, key as string);
      return target[key];
    },
  };

  const o = options?.deep
    ? createObservableDeeply(opts)
    : createObservable(opts);

  return o;
};

export function getWatchKeys<T>(
  cb: () => T
): [value: T, keys: [Observable<any>, string][]] {
  items.length = 0;
  listening = true;
  const value = cb();
  listening = false;
  const keys = items.slice(0);
  items.length = 0;
  return [value, keys];
}

export function watch(cb: () => void) {
  const [, keys] = getWatchKeys(cb);

  const unwatches: (() => void)[] = [];

  for (const [p, key] of keys) {
    unwatches.push(
      p.$keyChange.on((event) => {
        if (event.key === key) {
          cb();
        }
      })
    );
  }

  return () => {
    unwatches.forEach((u) => u());
  };
}
