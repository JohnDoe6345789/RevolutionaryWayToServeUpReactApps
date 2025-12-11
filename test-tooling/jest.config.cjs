const path = require("path");
const nodeModulesDir = path.join(__dirname, "node_modules");

module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  rootDir: ".",
  testMatch: ["**/tests/**/*.test.ts?(x)"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  moduleDirectories: ["node_modules", nodeModulesDir],
  modulePaths: [nodeModulesDir],
  moduleNameMapper: {
    "^@mui/material/(.*)$": "<rootDir>/node_modules/@mui/material/$1",
    "^@mui/material$": "<rootDir>/node_modules/@mui/material",
    "^react/jsx-runtime$": `${nodeModulesDir}/react/jsx-runtime.js`,
    "^react/jsx-dev-runtime$": `${nodeModulesDir}/react/jsx-dev-runtime.js`
  },
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json"
    }
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setupTests.ts"]
};
