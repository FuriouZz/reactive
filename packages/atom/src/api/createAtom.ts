import { createSignal } from "@furiouzz/reactive";
import makeAtom from "./makeAtom.js";

/**
 * Create a signal with single function for getter/setter
 * @public
 * @param value
 * @returns
 */
export default function createAtom<T>(value: T) {
  return makeAtom(createSignal(value));
}
