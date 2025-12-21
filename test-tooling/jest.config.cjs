const path = require("path");

module.exports = {
  testEnvironment: "jsdom",
  rootDir: path.resolve(__dirname),
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", {
      tsconfig: "tsconfig.json"
    }],
    "^.+\\.(js|jsx)$": "babel-jest"
  },
  transformIgnorePatterns: [
    "node_modules/(?!(ts-jest))"
  ],
  testMatch: ["<rootDir>/tests/**/*.test.ts?(x)"],
  collectCoverage: true,
  collectCoverageFrom: [
    "../src/**/*.{ts,tsx}"
  ],
  coveragePathIgnorePatterns: ["/node_modules/", "<rootDir>/tests/", "../bootstrap/"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  moduleDirectories: ["node_modules"],
  modulePaths: [
    path.resolve(__dirname, "node_modules"),
    path.resolve(__dirname, "../ci/node_modules")
  ],
  moduleNameMapper: {
    "^@mui/material/(.*)$": "<rootDir>/node_modules/@mui/material/$1",
    "^@mui/material$": "<rootDir>/node_modules/@mui/material",
    "^react/jsx-runtime$": require.resolve("react/jsx-runtime"),
    "^react/jsx-dev-runtime$": require.resolve("react/jsx-dev-runtime"),
    "^react$": require.resolve("react"),
    "^react-dom$": require.resolve("react-dom"),
    "^\\./(linkSrcNodeModules)$": "<rootDir>/tests/linkSrcNodeModules.js",
    "^../../../bootstrap/(.*)$": "<rootDir>/../bootstrap/$1",
    "^../../bootstrap/(.*)$": "<rootDir>/../bootstrap/$1"
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setupTests.ts"],
  testPathIgnorePatterns: ["<rootDir>/tests/bootstrap/"]
};
