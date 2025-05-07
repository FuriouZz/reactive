const IDs = new WeakMap<object, number>();
export default function generateID<T extends object>(target: T) {
  const id = (IDs.get(target.constructor) ?? 0) + 1;
  IDs.set(target.constructor, id);
  Object.defineProperty(target, "id", {
    value: id,
    writable: false,
    configurable: false,
  });
}
