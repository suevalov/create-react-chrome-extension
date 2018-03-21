/* eslint-disable no-await-in-loop,import/no-dynamic-require */

const glob = require("glob");
const paths = require("./paths");
const fileExists = require("file-exists");
const fileName = require("file-name");
const { manifestValues, readManifestValue } = require("./getManifestValues");

const getEntry = async params => {
  const pageName = readManifestValue(params.name);
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
  for (let i = 0; i < manifestValues.length; i += 1) {
    const entry = await getEntry(manifestValues[i]);
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
