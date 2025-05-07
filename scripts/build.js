import { Extractor, ExtractorConfig } from "@microsoft/api-extractor";
import { context } from "esbuild";
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ensureDirectory, ROOT_DIR } from "./common.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "../");
const watchMode = process.argv.includes("--watch");

/**
 * @param {string} packageDir
 */
function tsc(packageDir = "./") {
  spawnSync("tsc -p tsconfig.build.json", {
    stdio: "inherit",
    shell: true,
    cwd: packageDir,
  });
}

/**
 * @param {string} input
 * @param {string} output
 * @param {"cjs"|"esm"} format
 * @param {string} [packageDir]
 */
async function build(input, output, format, packageDir = "./") {
  const extension = format === "cjs" ? "cjs" : "js";
  const type = format === "cjs" ? "commonjs" : "module";
  const outfile = join(rootDir, `dist/${format}/${output}.${extension}`);

  ensureDirectory(dirname(outfile));

  const ctx = await context({
    entryPoints: [join(packageDir, input)],
    bundle: true,
    target: "es6",
    format,
    outfile,
    write: true,
    external: ["@furiouzz/reactive"],
  });

  if (watchMode) {
    await ctx.watch();
  } else {
    await ctx.rebuild();
    await ctx.dispose();
  }

  writeFileSync(
    `./dist/${format}/package.json`,
    JSON.stringify({ type }, null, 2),
  );
}

/**
 * @param {string} input
 * @param {string} output
 * @param {string} [packageDir]
 */
async function compile(input, output, packageDir = "./") {
  tsc(packageDir);

  await Promise.all([
    build(input, output, "cjs", packageDir),
    build(input, output, "esm", packageDir),
  ]);

  if (!watchMode) {
    const extractorConfigPath = resolve(ROOT_DIR, "api-extractor.json");
    const extractorConfig = ExtractorConfig.loadFileAndPrepare(extractorConfigPath);

    const typeSource = input.replace("src/", "types/").replace(".ts", ".d.ts");
    extractorConfig.mainEntryPointFilePath = join(packageDir, typeSource);
    extractorConfig.untrimmedFilePath = join(rootDir, "dist", `${output}.d.ts`);
    extractorConfig.reportConfigs.push(
      { variant: "public", fileName: join(rootDir, "temp", `${output}.md`) },
    );

    Extractor.invoke(extractorConfig, {
      localBuild: true,
      showVerboseMessages: true,
    });
  }
}

async function main() {
  await compile("src/index.ts", "index", rootDir);
  await compile("src/index.ts", "store", join(rootDir, "packages/store"));
  await compile("src/index.ts", "atom", join(rootDir, "packages/atom"));
  if (!watchMode) {
    await import("./validate-package.js");
  }
}

main();
