const MODE = "development";
const enabledSourceMap = MODE === "development";

const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const outputPath = path.resolve(__dirname, "public");

const mainConfig = {
  mode: MODE,
  entry: "./src/index.js",
  devServer: {
    contentBase: outputPath,
    // inlineモードだとAudioWorkletProcessorのバンドルにHMRのモジュールが挿入され、
    // AudioAPIがProcessorを読み込んだときにエラーが出る...
    inline: false,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
      },
      {
        test: /\.scss/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              url: false,
              sourceMap: enabledSourceMap,
              importLoaders: 2,
            },
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: enabledSourceMap,
            },
          },
        ],
      },
      // {
      //   test: /\.html$/,
      //   loader: "file-loader",
      // },
    ],
  },
  output: {
    path: `${__dirname}/public`,
    filename: "main.js",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
  ],
};

const audioWorkletProcessorConfig = {
    mode: MODE,
    target: "webworker",
    entry: {
      "CmpExper": "./src/AudioWorkletProcessor/CmpExper.ts",
    },
    devServer: {
      contentBase: outputPath,
    },
    output: {
      path: `${__dirname}/public`,
      filename: "[name].js",
      globalObject: "this",
    },
    resolve: {
      extensions: [".ts", ".js"],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
  };
  
  module.exports = [mainConfig, audioWorkletProcessorConfig];