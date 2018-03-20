/* eslint-disable no-param-reassign */

process.env.NODE_ENV = "production";

const webpack = require("webpack");
const config = require("./webpack.config");
const getEntries = require("./utils/getEntries");
const HtmlWebpackPlugin = require("html-webpack-plugin");

getEntries().then(entries => {
  entries.forEach(entry => {
    if (entry.js) {
      config.entry[entry.name] = entry.js.source;
    }
    if (entry.html) {
      config.plugins.push(
        new HtmlWebpackPlugin({
          template: entry.html.source,
          filename: `${entry.name}.html`,
          chunks: [entry.name]
        })
      );
    }
  });
  config.mode = "production";
  webpack(config, err => {
    if (err) throw err;
  });
});
