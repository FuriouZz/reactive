import { createSignal } from "@furiouzz/reactive";
import makeAtom from "./makeAtom.js";

export default function createAtom<T>(value: T) {
  return makeAtom(createSignal(value));
}
