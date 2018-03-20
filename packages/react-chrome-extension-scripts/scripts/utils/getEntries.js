/* eslint-disable no-await-in-loop,import/no-dynamic-require */

const glob = require("glob");
const get = require("lodash.get");
const fileExists = require("file-exists");
const fileName = require("file-name");
const paths = require("./paths");

const manifest = require(paths.manifest);

const possibilities = [
  {
    name: "browser_action",
    folder: "browser_action",
    manifest: () => get(manifest, "browser_action.default_popup")
  },
  {
    name: "page_action",
    folder: "page_action",
    manifest: () => get(manifest, "page_action.default_popup")
  },
  {
    name: "bookmarks",
    folder: "bookmarks",
    manifest: () => get(manifest, "chrome_url_overrides.bookmarks")
  },
  {
    name: "history",
    folder: "history",
    manifest: () => get(manifest, "chrome_url_overrides.history")
  },
  {
    name: "newtab",
    folder: "newtab",
    manifest: () => get(manifest, "chrome_url_overrides.newtab")
  },
  {
    name: "devtools",
    folder: "devtools",
    manifest: () => get(manifest, "devtools_page")
  },
  {
    name: "background",
    folder: "background",
    manifest: () => get(manifest, "background.page")
  },
  {
    name: "options",
    folder: "options",
    manifest: () =>
      get(manifest, "options_ui.page") || get(manifest, "options_page")
  }
];

// options

const getEntry = async params => {
  const pageName = params.manifest();
  if (!pageName) {
    return null;
  }
  const pageNameNoExt = fileName(pageName);
  let files = [
    `/${params.folder}/${pageNameNoExt}.html`,
    `/${params.folder}/${pageNameNoExt}.js`
  ].map(entry => ({
    source: paths.src + entry,
    exist: true
  }));

  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    const isFileExists = await fileExists(file.source);
    if (!isFileExists) {
      files[i].exist = false;
    }
  }
  files = files.filter(file => file !== null);
  if (files.length !== 2) {
    return null;
  }
  return { name: pageNameNoExt, html: files[0], js: files[1] };
};

const getContentScripts = async () => {
  const getAllFiles = () =>
    new Promise((resolve, reject) => {
      glob(`${paths.src}/content-scripts/*.js`, (err, files) => {
        if (err) {
          reject(err);
        } else {
          resolve(files);
        }
      });
    });
  const files = await getAllFiles();
  return files.map(file => ({
    name: fileName(file),
    js: {
      source: file,
      exist: true
    }
  }));
};

const getOtherEntires = async () => {
  const getAllFiles = () =>
    new Promise((resolve, reject) => {
      glob(`${paths.src}/entries/*.html`, (err, files) => {
        if (err) {
          reject(err);
        } else {
          resolve(files);
        }
      });
    });

  const files = await getAllFiles();
  const result = [];

  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    const name = fileName(file);
    const entry = await getEntry({
      name,
      folder: "entries",
      manifest: () => `${name}.html`
    });
    if (entry) {
      result.push(entry);
    }
  }
  return result;
};

module.exports = async () => {
  const entries = [];
  for (let i = 0; i < possibilities.length; i += 1) {
    const entry = await getEntry(possibilities[i]);
    if (entry) {
      entries.push(entry);
    }
  }
  const contentScripts = await getContentScripts();
  const otherEntries = await getOtherEntires();
  contentScripts.forEach(entry => entries.push(entry));
  otherEntries.forEach(entry => entries.push(entry));
  return entries;
};
