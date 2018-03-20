/* eslint-disable import/no-dynamic-require */
const webpack = require("webpack");
const paths = require("./utils/paths");
const env = require("./utils/env");

const originalPackageJson = require(paths.appPackageJson);
const CleanWebpackPlugin = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const WriteFilePlugin = require("write-file-webpack-plugin");

const fileExtensions = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "eot",
  "otf",
  "svg",
  "ttf",
  "woff",
  "woff2"
];

const options = {
  entry: {},
  output: {
    path: paths.build,
    filename: "[name].js"
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        loader: "style-loader!css-loader"
      },
      {
        test: new RegExp(`.(${fileExtensions.join("|")})$`),
        loader: "url-loader",
        options: {
          limit: 10000,
          name: "[name].[ext]"
        },
        exclude: /node_modules/
      },
      {
        test: /\.html$/,
        loader: "html-loader",
        exclude: /node_modules/
      },
      {
        test: /\.(js|jsx)$/,
        loader: "babel-loader",
        exclude: /node_modules/
      }
    ]
  },
  node: {
    fs: "empty",
    net: "empty",
    tls: "empty"
  },
  resolve: {
    extensions: fileExtensions
      .map(extension => `.${extension}`)
      .concat([".jsx", ".js", ".css", ".json"])
  },
  optimization: {
    namedModules: true, // NamedModulesPlugin()
    noEmitOnErrors: true, // NoEmitOnErrorsPlugin
    concatenateModules: true // ModuleConcatenationPlugin
  },
  plugins: [
    // clean the build folder
    new CleanWebpackPlugin([paths.build], {
      root: paths.root
    }),
    // expose and write the allowed env vars on the compiled bundle
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(env.NODE_ENV),
      __DEV__: env.NODE_ENV === "development"
    }),
    new CopyWebpackPlugin([
      {
        from: paths.manifest,
        transform(content) {
          // generates the manifest file using the package.json informations
          return Buffer.from(
            JSON.stringify({
              name: originalPackageJson.name,
              description: originalPackageJson.description,
              version: originalPackageJson.version,
              ...JSON.parse(content.toString())
            })
          );
        }
      },
      {
        from: `${paths.staticFiles}/**/*.*`
      }
    ]),
    new WriteFilePlugin()
  ]
};

if (env.NODE_ENV === "development") {
  options.devtool = "cheap-module-eval-source-map";
}

module.exports = options;
