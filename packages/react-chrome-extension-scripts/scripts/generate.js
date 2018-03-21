/* eslint-disable import/no-dynamic-require,global-require */

const prompts = require("prompts");
const chalk = require("chalk");
const path = require("path");
const set = require("lodash.set");
const paths = require("./utils/paths");
const fs = require("fs-extra");
const fileTemplates = require("./utils/fileTemplates");
const {
  manifestValues,
  readManifestValue
} = require("./utils/getManifestValues");

const choices = manifestValues
  .map(value => {
    const entryName = readManifestValue(value.name);
    if (entryName) {
      return null;
    }
    return {
      title: value.title,
      value
    };
  })
  .filter(choice => choice !== null);

choices.push({
  title: "Content Script",
  value: {
    folder: "content-scripts",
    onlyJs: true,
    custom: true
  }
});

choices.push({
  title: "Custom Entry",
  value: {
    folder: "entries",
    custom: true
  }
});

const writeFiles = (folder, files) => {
  const fullFolderPath = path.join(paths.src, folder);
  fs.ensureDirSync(fullFolderPath);
  files.forEach(file => {
    const fullFilePath = path.join(fullFolderPath, file.path);
    fs.writeFileSync(fullFilePath, file.content);
    console.log(chalk.green(`${fullFilePath} is generated!`));
  });
};

const updateManifestFile = (manifestPaths, value) => {
  const manifest = require(paths.manifest);
  const updatedManifest = set(manifest, manifestPaths[0], value);
  fs.writeFileSync(paths.manifest, JSON.stringify(updatedManifest, null, 2));
  console.log(chalk.green(`Manifest is updated!`));
};

prompts({
  type: "select",
  name: "value",
  message: "What you want to add to your extension?",
  choices,
  initial: 0
}).then(({ value }) => {
  if (value.custom) {
    prompts({
      type: "text",
      name: "entryName",
      message: "entry name:"
    }).then(({ entryName }) => {
      const files = [
        { path: `${entryName}.js`, content: fileTemplates.jsTemplate() }
      ];
      if (!value.onlyJs) {
        files.push({
          path: `${entryName}.html`,
          content: fileTemplates.htmlTemplate()
        });
      }
      writeFiles(value.folder, files);
    });
  } else {
    writeFiles(value.folder, [
      { path: `${value.name}.html`, content: fileTemplates.htmlTemplate() },
      { path: `${value.name}.js`, content: fileTemplates.jsTemplate() }
    ]);
    updateManifestFile(value.manifest, `${value.name}.html`);
  }
});
