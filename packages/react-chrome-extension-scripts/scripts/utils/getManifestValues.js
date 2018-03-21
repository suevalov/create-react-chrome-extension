/* eslint-disable import/no-dynamic-require */

const paths = require("./paths");
const get = require("lodash.get");
const find = require("lodash.find");

const manifest = require(paths.manifest);

const manifestValues = [
  {
    name: "browser_action",
    title: "Browser action",
    folder: "browser_action",
    manifest: ["browser_action.default_popup"]
  },
  {
    name: "page_action",
    title: "Page action",
    folder: "page_action",
    manifest: ["page_action.default_popup"]
  },
  {
    name: "bookmarks",
    title: "Bookmarks override page",
    folder: "bookmarks",
    manifest: ["chrome_url_overrides.bookmarks"]
  },
  {
    name: "history",
    title: "History override page",
    folder: "history",
    manifest: ["chrome_url_overrides.history"]
  },
  {
    name: "newtab",
    title: "Newtab override page",
    folder: "newtab",
    manifest: ["chrome_url_overrides.newtab"]
  },
  {
    name: "devtools",
    title: "Developer tools",
    folder: "devtools",
    manifest: ["devtools_page"]
  },
  {
    name: "background",
    title: "Background",
    folder: "background",
    manifest: ["background.page"]
  },
  {
    name: "options",
    title: "Options",
    folder: "options",
    manifest: ["options_ui.page", "options_page"]
  }
];

const readManifestValue = name => {
  const value = find(manifestValues, item => item.name === name);
  if (!value) {
    return undefined;
  }
  return value.manifest.reduce(
    (prev, path) => prev || get(manifest, path),
    undefined
  );
};

module.exports = {
  manifestValues,
  readManifestValue
};
