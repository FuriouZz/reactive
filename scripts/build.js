import { Extractor, ExtractorConfig } from "@microsoft/api-extractor";
import { spawnSync } from "child_process";
import { resolve } from "path";
import { ROOT_DIR, SPAWN_OPTIONS } from "./common.js";

async function main() {
  await import("./dev.js");

  const build = "npx esbuild --bundle --target=es6 lib/index.ts";
  spawnSync(`${build} --format=cjs --outfile=dist/index.cjs.js`, SPAWN_OPTIONS);
  spawnSync(`${build} --format=esm --outfile=dist/index.esm.js`, SPAWN_OPTIONS);

  const extractorConfigPath = resolve(ROOT_DIR, `api-extractor.json`);
  const extractorConfig =
    ExtractorConfig.loadFileAndPrepare(extractorConfigPath);
  const extractorResult = Extractor.invoke(extractorConfig, {
    localBuild: true,
    showVerboseMessages: true,
  });
}

main();
