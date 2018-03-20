const path = require("path");
const fs = require("fs");

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

module.exports = {
  src: resolveApp("src"),
  root: resolveApp(""),
  build: resolveApp("build"),
  staticFiles: resolveApp("static"),
  yarnLockFile: resolveApp("yarn.lock"),
  manifest: resolveApp("src/manifest.json"),
  appNodeModules: resolveApp("node_modules"),
  appPackageJson: resolveApp("package.json")
};
