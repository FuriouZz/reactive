import { spawnSync } from "child_process";
import { cleanup, SPAWN_OPTIONS } from "./common.js";

if (!process.argv.includes("--no-cleanup")) {
  cleanup();
}
const watch = process.argv.includes("--watch")
  ? "--watch --preserveWatchOutput"
  : "";
spawnSync(`npx tsc -p tsconfig.json ${watch}`, SPAWN_OPTIONS);
