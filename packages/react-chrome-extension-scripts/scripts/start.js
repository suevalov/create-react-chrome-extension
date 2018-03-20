/* eslint-disable no-param-reassign */

process.env.NODE_ENV = "development";

const paths = require("./utils/paths");
const WebpackDevServer = require("webpack-dev-server");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const config = require("./webpack.config");
const env = require("./utils/env");
const getEntries = require("./utils/getEntries");
const propmtMissingFiles = require("./utils/promptMissingFiles");

propmtMissingFiles(getEntries()).then(entries => {
  entries.forEach(entry => {
    if (entry.js) {
      if (entry.name === "background") {
        config.entry[entry.name] = entry.js.source;
      } else {
        config.entry[entry.name] = [
          `webpack-dev-server/client?http://localhost:${env.PORT}`,
          "webpack/hot/dev-server",
          entry.js.source
        ];
      }
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

  config.plugins = [new webpack.HotModuleReplacementPlugin()].concat(
    config.plugins || []
  );

  config.mode = "development";

  const compiler = webpack(config);

  const server = new WebpackDevServer(compiler, {
    stats: "minimal",
    hot: true,
    contentBase: paths.build,
    headers: { "Access-Control-Allow-Origin": "*" }
  });

  server.listen(env.PORT);
});
