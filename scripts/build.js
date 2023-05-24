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
 * @param {"cjs"|"esm"} format
 */
function build(input, output, format) {
  const build = "npx esbuild --bundle --target=es6 " + input;
  const extension = format === "cjs" ? "cjs" : "js";
  const type = format === "cjs" ? "commonjs" : "module";

  spawnSync(
    `${build} --format=${format} --outfile=dist/${format}/${output}.${extension}`,
    SPAWN_OPTIONS
  );

  writeFileSync(
    `./dist/${format}/package.json`,
    JSON.stringify({ type }, null, 2)
  );
}

/**
 *
 * @param {string} input
 * @param {string} output
 */
function compile(input, output) {
  build(input, output, "cjs");
  build(input, output, "esm");

  const extractorConfigPath = resolve(ROOT_DIR, `api-extractor.json`);
  const extractorConfig =
    ExtractorConfig.loadFileAndPrepare(extractorConfigPath);

  const typeSource = input.replace("lib/", "build/").replace(".ts", ".d.ts");
  extractorConfig.mainEntryPointFilePath = join(rootDir, typeSource);
  extractorConfig.untrimmedFilePath = join(rootDir, "dist", `${output}.d.ts`);
  extractorConfig.reportFilePath = join(rootDir, "temp", `${output}.md`);

  Extractor.invoke(extractorConfig, {
    localBuild: true,
    showVerboseMessages: true,
  });
}

async function main() {
  await import("./dev.js");
  compile("lib/entries/index.ts", "index");
  compile("lib/entries/atom.ts", "atom");
  compile("lib/entries/store.ts", "store");
  await import("./validate-package.js");
}

main();
