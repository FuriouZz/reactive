import fs from "fs-extra";
import { spawnSync } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const OPTIONS = { shell: true, stdio: "inherit" };

fs.removeSync(join(__dirname, "../dist"));

const watch = process.argv.includes("--watch") ? "--watch" : "";
spawnSync(`npx tsc -p tsconfig.json ${watch}`, OPTIONS);
