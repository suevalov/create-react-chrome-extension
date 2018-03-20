/* eslint-disable import/no-dynamic-require */

const paths = require("./paths");
const get = require("lodash.get");

const manifest = require(paths.manifest);

module.exports = () => [
  {
    name: "browser_action",
    title: "Browser action",
    folder: "browser_action",
    manifest: () => get(manifest, "browser_action.default_popup")
  },
  {
    name: "page_action",
    title: "Page action",
    folder: "page_action",
    manifest: () => get(manifest, "page_action.default_popup")
  },
  {
    name: "bookmarks",
    title: "Bookmarks override page",
    folder: "bookmarks",
    manifest: () => get(manifest, "chrome_url_overrides.bookmarks")
  },
  {
    name: "history",
    title: "History override page",
    folder: "history",
    manifest: () => get(manifest, "chrome_url_overrides.history")
  },
  {
    name: "newtab",
    title: "Newtab override page",
    folder: "newtab",
    manifest: () => get(manifest, "chrome_url_overrides.newtab")
  },
  {
    name: "devtools",
    title: "Developer tools",
    folder: "devtools",
    manifest: () => get(manifest, "devtools_page")
  },
  {
    name: "background",
    title: "Background",
    folder: "background",
    manifest: () => get(manifest, "background.page")
  },
  {
    name: "options",
    title: "Options",
    folder: "options",
    manifest: () =>
      get(manifest, "options_ui.page") || get(manifest, "options_page")
  }
];
