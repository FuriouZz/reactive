import { Extractor, ExtractorConfig } from "@microsoft/api-extractor";
import { spawnSync } from "child_process";
import { writeFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { ROOT_DIR, SPAWN_OPTIONS } from "./common.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "../");

/**
 *
 * @param {string} input
 * @param {string} output
 */
function compile(input, output) {
  const build = "npx esbuild --bundle --target=es6 " + input;
  spawnSync(
    `${build} --format=cjs --outfile=dist/cjs/${output}.js`,
    SPAWN_OPTIONS
  );
  spawnSync(
    `${build} --format=esm --outfile=dist/esm/${output}.js`,
    SPAWN_OPTIONS
  );

  const extractorConfigPath = resolve(ROOT_DIR, `api-extractor.json`);
  const extractorConfig =
    ExtractorConfig.loadFileAndPrepare(extractorConfigPath);

  const typeSource = input.replace("lib/", "build/").replace(".ts", ".d.ts");
  extractorConfig.mainEntryPointFilePath = join(rootDir, typeSource);
  extractorConfig.untrimmedFilePath = join(rootDir, "dist", `${output}.d.ts`);
  extractorConfig.reportFilePath = join(rootDir, "temp", `${output}.md`);

  const extractorResult = Extractor.invoke(extractorConfig, {
    localBuild: true,
    showVerboseMessages: true,
  });
}

async function main() {
  await import("./dev.js");

  compile("lib/index.ts", "index");

  writeFileSync(
    "./dist/cjs/package.json",
    JSON.stringify({ type: "commonjs" }, null, 2)
  );

  writeFileSync(
    "./dist/esm/package.json",
    JSON.stringify({ type: "module" }, null, 2)
  );

  // const extractorConfigPath = resolve(ROOT_DIR, `api-extractor.json`);
  // const extractorConfig =
  //   ExtractorConfig.loadFileAndPrepare(extractorConfigPath);

  // console.log(extractorConfig.mainEntryPointFilePath);

  // const extractorResult = Extractor.invoke(extractorConfig, {
  //   localBuild: true,
  //   showVerboseMessages: true,
  // });
}

main();
