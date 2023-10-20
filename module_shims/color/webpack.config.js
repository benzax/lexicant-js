const path = require("path");

module.exports = {
  entry: __dirname + "/index.js",
  output: {
    path: path.resolve(__dirname, "../.."),
    filename: "color.js",
    libraryTarget: "umd",
  },
};
