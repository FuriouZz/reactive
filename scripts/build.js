import { Extractor, ExtractorConfig } from "@microsoft/api-extractor";
import { writeFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { ROOT_DIR, ensureDirectory } from "./common.js";
import { context } from "esbuild";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "../");
const watchMode = process.argv.includes("--watch");

/**
 *
 * @param {string} input
 * @param {string} output
 * @param {"cjs"|"esm"} format
 */
async function build(input, output, format) {
  const extension = format === "cjs" ? "cjs" : "js";
  const type = format === "cjs" ? "commonjs" : "module";
  const outfile = `dist/${format}/${output}.${extension}`;

  ensureDirectory(dirname(outfile));

  const ctx = await context({
    entryPoints: [input],
    bundle: true,
    target: "es6",
    format,
    outfile,
    write: true,
  });

  if (watchMode) {
    await ctx.watch();
  } else {
    await ctx.rebuild();
    await ctx.dispose();
  }

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
async function compile(input, output) {
  await Promise.all([build(input, output, "cjs"), build(input, output, "esm")]);

  if (!watchMode) {
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
}

async function main() {
  if (watchMode) {
    import("./dev.js");
  } else {
    await import("./dev.js");
  }
  await Promise.all([
    compile("lib/entries/index.ts", "index"),
    compile("lib/entries/atom.ts", "atom"),
  ]);
  if (!watchMode) {
    await import("./validate-package.js");
  }
}

main();
