/* eslint-disable prefer-destructuring,import/no-dynamic-require,global-require,no-console */

const path = require("path");
const fs = require("fs-extra");
const os = require("os");
const spawn = require("cross-spawn");
const execSync = require("child_process").execSync;
const chalk = require("chalk");

function isInGitRepository() {
  try {
    execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
    return true;
  } catch (e) {
    return false;
  }
}

function isInMercurialRepository() {
  try {
    execSync("hg --cwd . root", { stdio: "ignore" });
    return true;
  } catch (e) {
    return false;
  }
}

function tryGitInit(appPath) {
  let didInit = false;
  try {
    execSync("git --version", { stdio: "ignore" });
    if (isInGitRepository() || isInMercurialRepository()) {
      return false;
    }

    execSync("git init", { stdio: "ignore" });
    didInit = true;

    execSync("git add -A", { stdio: "ignore" });
    execSync('git commit -m "Initial commit"', {
      stdio: "ignore"
    });
    return true;
  } catch (e) {
    if (didInit) {
      // If we successfully initialized but couldn't commit,
      // maybe the commit author config is not set.
      // In the future, we might supply our own committer
      // like Ember CLI does, but for now, let's just
      // remove the Git files to avoid a half-done state.
      try {
        // unlinkSync() doesn't work on directories.
        fs.removeSync(path.join(appPath, ".git"));
      } catch (removeErr) {
        // Ignore.
      }
    }
    return false;
  }
}

module.exports = (appPath, appName, originalDirectory) => {
  const ownPackageName = require(path.join(__dirname, "..", "package.json"))
    .name;
  const ownPath = path.join(appPath, "node_modules", ownPackageName);
  const appPackage = require(path.join(appPath, "package.json"));

  appPackage.dependencies = appPackage.dependencies || {};
  appPackage.scripts = {
    start: "react-chrome-extension-scripts start",
    build: "react-chrome-extension-scripts build",
    precommit: "lint-staged"
  };
  appPackage["lint-staged"] = {
    "*.{js,jsx,css}": ["./node_modules/.bin/prettier --write", "git add"]
  };

  appPackage.browserslist = ["last 2 Chrome versions"];

  fs.writeFileSync(
    path.join(appPath, "package.json"),
    JSON.stringify(appPackage, null, 2) + os.EOL
  );

  const templatePath = path.join(ownPath, "template");

  if (fs.existsSync(templatePath)) {
    fs.copySync(templatePath, appPath);
  }

  try {
    fs.moveSync(
      path.join(appPath, "gitignore"),
      path.join(appPath, ".gitignore"),
      []
    );
  } catch (err) {
    // Append if there's already a `.gitignore` file there
    if (err.code === "EEXIST") {
      const data = fs.readFileSync(path.join(appPath, "gitignore"));
      fs.appendFileSync(path.join(appPath, ".gitignore"), data);
      fs.unlinkSync(path.join(appPath, "gitignore"));
    } else {
      throw err;
    }
  }

  if (tryGitInit(appPath)) {
    console.log();
    console.log("Initialized a git repository.");
  }

  const command = "yarnpkg";
  const args = ["add", "--exact"];
  args.push("react", "react-dom", "lint-staged", "husky", "prettier");

  console.log(`Installing react and react-dom using ${command}...`);
  console.log();

  const proc = spawn.sync(command, args, { stdio: "inherit" });
  if (proc.status !== 0) {
    console.error(`\`${command} ${args.join(" ")}\` failed`);
    return;
  }

  // Display the most elegant way to cd.
  // This needs to handle an undefined originalDirectory for
  // backward compatibility with old global-cli's.
  let cdpath;
  if (originalDirectory && path.join(originalDirectory, appName) === appPath) {
    cdpath = appName;
  } else {
    cdpath = appPath;
  }

  const displayedCommand = "yarn";

  console.log();
  console.log(`Success! Created ${appName} at ${appPath}`);
  console.log("Inside that directory, you can run several commands:");
  console.log();
  console.log(chalk.cyan(`  ${displayedCommand} start`));
  console.log("    Starts the development server.");
  console.log();
  console.log(chalk.cyan(`  ${displayedCommand} build`));
  console.log("    Bundles the app into static files for production.");
  console.log();
  console.log("We suggest that you begin by typing:");
  console.log();
  console.log(chalk.cyan("  cd"), cdpath);
  console.log(`  ${chalk.cyan(`${displayedCommand} start`)}`);
  console.log();
  console.log("Happy hacking!");
};
