/* eslint-disable  no-use-before-define, prefer-promise-reject-errors, no-console, import/no-dynamic-require, global-require */

const chalk = require("chalk");
const commander = require("commander");
const fs = require("fs-extra");
const path = require("path");
const spawn = require("cross-spawn");
const os = require("os");
const packageJson = require("./package.json");

let projectName;

const program = new commander.Command(packageJson.name)
  .version(packageJson.version)
  .arguments("<project-directory>")
  .usage(`${chalk.green("<project-directory>")} [options]`)
  .action(name => {
    projectName = name;
  })
  .option("--verbose", "print additional logs")
  .parse(process.argv);

if (typeof projectName === "undefined") {
  console.error("Please specify the project directory:");
  console.log(
    `  ${chalk.cyan(program.name())} ${chalk.green("<project-directory>")}`
  );
  console.log();
  console.log("For example:");
  console.log(
    `  ${chalk.cyan(program.name())} ${chalk.green("my-chromium-extension")}`
  );
  console.log();
  console.log(
    `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
  );
  process.exit(1);
}

createExtension(projectName, program.verbose, program.scriptsVersion);

function createExtension(name, verbose, version) {
  const root = path.resolve(name);
  const appName = path.basename(root);

  if (fs.pathExistsSync(name)) {
    console.error(chalk.red(`${root} folder already exists.`));
    process.exit(0);
  }
  fs.ensureDirSync(name);

  console.log(`Creating a new Chrome extension in ${chalk.green(root)}.`);
  console.log();

  fs.writeFileSync(
    path.join(root, "package.json"),
    JSON.stringify(
      {
        name: appName,
        version: "0.1.0",
        private: true
      },
      null,
      2
    ) + os.EOL
  );

  const originalDirectory = process.cwd();
  run(root, appName, version, verbose, originalDirectory);
}

function install(root, dependencies, verbose, isDev) {
  return new Promise((resolve, reject) => {
    const command = "yarnpkg";
    const args = ["add", "--exact"];
    if (isDev) {
      args.push("--dev");
    }
    [].push.apply(args, dependencies);

    // Explicitly set cwd() to work around issues like
    // https://github.com/facebook/create-react-app/issues/3326.
    // Unfortunately we can only do this for Yarn because npm support for
    // equivalent --prefix flag doesn't help with this issue.
    // This is why for npm, we run checkThatNpmCanReadCwd() early instead.
    args.push("--cwd");
    args.push(root);

    if (verbose) {
      args.push("--verbose");
    }

    const child = spawn(command, args, { stdio: "inherit" });
    child.on("close", code => {
      if (code !== 0) {
        reject({
          command: `${command} ${args.join(" ")}`
        });
        return;
      }
      resolve();
    });
  });
}

function run(root, appName, version, verbose) {
  const allDependencies = [
    "react-chrome-extension-scripts",
    "react",
    "react-dom"
  ];

  const devDependencies = ["lint-staged", "husky", "prettier"];

  console.log("Installing packages. This might take a couple of minutes.");

  return install(root, devDependencies, verbose, true).then(() =>
    install(root, allDependencies, verbose, false).then(() => {
      const init = require(`${root}/node_modules/react-chrome-extension-scripts/scripts/init.js`);
      init(root, appName, verbose);
    })
  );
}
