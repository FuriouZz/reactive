/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
  preset: "ts-jest/presets/js-with-ts-esm",
  testEnvironment: "node",
  rootDir: "./test",
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
  extensionsToTreatAsEsm: [".ts"],
  transform: {},
};
