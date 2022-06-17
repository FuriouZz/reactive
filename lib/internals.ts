import { Observable } from "./types";

export const targetToReactive = new WeakMap<object, Observable<object>>();
export const reactiveToTarget = new WeakMap<Observable<object>, object>();
