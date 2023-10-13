import { readFile, readdir, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  const entriesDir = join(__dirname, "../lib/entries");
  const packgagePath = join(__dirname, "../package.json");

  const files = (await readdir(entriesDir))
    .filter((v) => v.endsWith(".ts"))
    .map((v) => v.replace(".ts", ""));

  const exports = {};

  for (const entry of files) {
    const exportValues = {
      import: {
        types: `./dist/${entry}.d.ts`,
        default: `./dist/esm/${entry}.js`,
      },
      require: {
        types: `./dist/${entry}.d.ts`,
        default: `./dist/cjs/${entry}.cjs`,
      },
    };

    exports[`./${entry}`] = exportValues;
    exports[`./${entry}.js`] = exportValues;
    if (entry === "index") {
      exports["."] = exportValues;
    }
  }

  const json = JSON.parse(await readFile(packgagePath, "utf-8"));
  json.exports = exports;
  await writeFile(packgagePath, JSON.stringify(json, null, 2));
}

main();
