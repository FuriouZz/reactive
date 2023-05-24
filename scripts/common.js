import { dirname, join } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const DIST_DIR = join(__dirname, "../dist");
export const BUILD_DIR = join(__dirname, "../build");
export const ROOT_DIR = join(__dirname, "../");
export const SPAWN_OPTIONS = { shell: true, stdio: "inherit" };

/**
 *
 * @param {string} path
 * @returns
 */
export const isDirectory = (path) => {
  try {
    const stat = fs.statSync(path);
    return stat.isDirectory();
    // eslint-disable-next-line no-empty
  } catch (e) {}
  return false;
};

export const cleanup = () => {
  if (isDirectory(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  if (isDirectory(BUILD_DIR)) {
    fs.rmSync(BUILD_DIR, { recursive: true, force: true });
  }
};
