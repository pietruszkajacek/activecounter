import { fileURLToPath } from "url";
import path from "path";
import GasPlugin from "gas-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  entry: "./src/main.ts",
  output: {
    path: path.resolve(__dirname, "apps-script"),
    filename: "main.js",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ["ts-loader"],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts"],
  },
  optimization: {
    minimize: false,
    minimizer: [
      new TerserPlugin({
        minify: TerserPlugin.uglifyJsMinify,
        // `terserOptions` options will be passed to `uglify-js`
        // Link to options - https://github.com/mishoo/UglifyJS#minify-options
        terserOptions: {
          mangle: true,
          compress: true,
        },
      }),
      // new TerserPlugin({
      //   terserOptions: {
      //     mangle: false,
      //     output: {
      //       comments: /@customFunction/i
      //     }
      //   }
      // }),
    ],
  },
  plugins: [new GasPlugin()],
};

export default config;
