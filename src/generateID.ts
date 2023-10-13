const IDs = new WeakMap<object, number>();
export default function generateID<T extends object>(target: T) {
  const id = (IDs.get(target) ?? 0) + 1;
  IDs.set(target, id);
  Object.defineProperty(target, "id", {
    value: id,
    writable: false,
    configurable: false,
  });
}
