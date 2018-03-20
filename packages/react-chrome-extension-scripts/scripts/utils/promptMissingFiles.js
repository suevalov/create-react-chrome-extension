/* eslint-disable no-console, no-await-in-loop */

const prompts = require("prompts");
const chalk = require("chalk");
const writeFile = require("write");
const fileTemplates = require("./fileTemplates");

module.exports = async promise => {
  const entries = await promise;
  const existingEntires = [];
  const missingEntries = [];
  entries.forEach(entry => {
    if (
      (entry.js && entry.js.exist === false) ||
      (entry.html && entry.html.exist === false)
    ) {
      missingEntries.push(entry);
    } else {
      existingEntires.push(entry);
    }
  });
  if (missingEntries.length === 0) {
    return entries;
  }
  missingEntries.forEach(entry => {
    if (entry.js && entry.js.exist === false) {
      console.log(chalk.red(`Missing file: ${entry.js.source}`));
    }
    if (entry.html && entry.html.exist === false) {
      console.log(chalk.red(`Missing file: ${entry.html.source}`));
    }
  });
  const answer = await prompts({
    type: "confirm",
    name: "value",
    message:
      "Some files are declared in manifest.json, but don't exist. Do you want to generate them?",
    initial: false
  });
  if (answer.value === false) {
    console.log(
      chalk.yellow(
        "You refused to generate missing files. Create them manually or remove them from manifest.json"
      )
    );
    return existingEntires;
  }
  for (let i = 0; i < missingEntries.length; i += 1) {
    const entry = missingEntries[i];
    if (entry.js && entry.js.exist === false) {
      await writeFile.promise(entry.js.source, fileTemplates.jsTemplate());
      console.log(chalk.green(`${entry.js.source} is generated!`));
      entry.js.exist = true;
    }
    if (entry.html && entry.html.exist === false) {
      await writeFile.promise(entry.html.source, fileTemplates.htmlTemplate());
      console.log(chalk.green(`${entry.html.source} is generated!`));
      entry.html.exist = true;
    }
    existingEntires.push(entry);
  }
  return existingEntires;
};
