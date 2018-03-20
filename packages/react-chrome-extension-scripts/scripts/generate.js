const prompts = require("prompts");
const getManifestValues = require("./utils/getManifestValues");

const manifestValues = getManifestValues();

const choices = manifestValues
  .map(value => {
    if (value.manifest()) {
      return null;
    }
    return {
      title: value.title,
      value: {
        folder: value.folder
      }
    };
  })
  .filter(choice => choice !== null);

prompts({
  type: "select",
  name: "value",
  message: "What you want to add to your extension?",
  choices,
  initial: 0
}).then(response => {
  console.log(response);
});
