import { difference } from "@furiouzz/lol/array";
import { flat } from "@furiouzz/lol/object";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT_DIR } from "./common.js";

function main() {
  let isValid = true;

  const json = JSON.parse(
    readFileSync(join(ROOT_DIR, "package.json"), "utf-8"),
  );

  const { stdout } = spawnSync("npm pack --dry-run --json", {
    stdio: "pipe",
    shell: true,
  });
  const pack = JSON.parse(stdout.toString("utf-8").trim())[0];

  const files = pack.files.map((e) => e.path);

  const exports = [...new Set(Object.values(flat(json.exports)))]
    .filter((f) => !f.includes("*"))
    .map((f) => f.replace("./", ""));

  const missings = difference(exports, files);

  if (missings.length > 0) {
    console.log(`Exports files are missings`);
    console.log(...missings);
    isValid = false;
  }

  process.exitCode = isValid ? 0 : 1;
}

main();
