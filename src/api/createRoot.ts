import RootScope from "../RootScope";
import type { Callable } from "../types";

/**
 * @public
 */
export default function createRoot(cb: (dispose: Callable) => void) {
  const root = new RootScope();
  cb(() => root.dispose());
}
