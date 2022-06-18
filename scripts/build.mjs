import { Extractor, ExtractorConfig } from "@microsoft/api-extractor";
import fs from "fs-extra";
import { spawnSync } from "child_process";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const OPTIONS = { shell: true, stdio: "inherit" };

fs.removeSync(join(__dirname, "../dist"));

const build = "npx esbuild --bundle --target=es2020 lib/index.ts";
spawnSync(`${build} --format=cjs --outfile=dist/index.cjs.js`, OPTIONS);
spawnSync(`${build} --format=esm --outfile=dist/index.esm.js`, OPTIONS);

spawnSync(`npx tsc -p tsconfig.json --emitDeclarationOnly --outDir ./temp/types`, OPTIONS);
const extractorConfigPath = resolve(__dirname, `../api-extractor.json`);
const extractorConfig = ExtractorConfig.loadFileAndPrepare(extractorConfigPath);
const extractorResult = Extractor.invoke(extractorConfig, {
  localBuild: true,
  showVerboseMessages: true,
});
