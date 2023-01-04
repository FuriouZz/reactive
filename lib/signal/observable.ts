import { atom, makeAtom } from "./atom.js";
import { createEffect } from "./signal.js";
import { Atom, Observable, Signal, Subscriber } from "./types.js";

export function makeObservable<T>(
  signalOrAtom: Signal<T> | Atom<T> | (() => T)
) {
  let state: Observable<T>;
  if (Array.isArray(signalOrAtom)) {
    state = makeAtom(signalOrAtom) as Observable<T>;
  } else {
    state = signalOrAtom as Observable<T>;
  }

  const subscribers: [Subscriber<T>, any][] = [];

  createEffect<T>((oldValue) => {
    const newValue = state();

    for (let i = 0; i < subscribers.length; i++) {
      const [subscriber, caller] = subscribers[i];
      subscriber.call(caller, newValue, oldValue);
    }

    return newValue;
  }, state());

  const _subscriberIndex = (subscriber: Subscriber<T>) => {
    return subscribers.findIndex(([s]) => s === subscriber);
  };

  const subscribe = (subscriber: Subscriber<T>, caller?: any) => {
    if (_subscriberIndex(subscriber) === -1) {
      subscribers.push([subscriber, caller]);
    }
    return () => unsubscribe(subscriber);
  };

  const unsubscribe = (subscriber: Subscriber<T>) => {
    const index = _subscriberIndex(subscriber);
    if (index > -1) {
      subscribers.splice(index, 1);
    }
  };

  const clear = () => {
    subscribers.length = 0;
  };

  state.subscribe = subscribe;
  state.unsubscribe = unsubscribe;
  state.clear = clear;
  return state;
}

export function observable<T>(defaultValue: T) {
  const state = atom(defaultValue) as Observable<T>;
  return makeObservable(state);
}
