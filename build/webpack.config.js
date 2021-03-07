const {resolve} = require('path');
const {DefinePlugin, IgnorePlugin} = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const {VueLoaderPlugin} = require('vue-loader');
const isDevServer = process.env.WEBPACK_DEV_SERVER;

const config = {
  entry: {
    'index': resolve(__dirname, '../src/index.js'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.vue$/,
        use: 'vue-loader',
      },
      {
        test: /\.pug$/,
        oneOf: [
          {
            resourceQuery: /^\?vue/,
            use: ['pug-plain-loader'],
          },
          {
            use: ['pug-loader'],
          },
        ],
      },
      {
        test: /\.styl(us)?$/,
        use: [
          isDevServer ? 'style-loader' : MiniCSSExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'stylus-loader',
        ],
      },
      {
        test: /\.css$/,
        use: [
          isDevServer ? 'style-loader' : MiniCSSExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
        ],
      },
      {
        test: /\.(webp|png|jpg|gif|svg|woff2|eot|woff|ttf|ico|mp4)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[hash].[ext]',
              outputPath: 'assets',
              publicPath: 'assets',
              esModule: false,
            },
          },
        ],
      },
    ],
  },
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
  resolve: {
    extensions: ['.js', '.json', '.vue'],
    alias: {
      '@': resolve(__dirname, '../src'),
    },
  },
  target: 'web',
  plugins: [
    new VueLoaderPlugin(),
    new DefinePlugin({
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      isDevServer,
    }),
    new IgnorePlugin(/^\.\/locale$/, /moment$/),
    new HtmlWebpackPlugin({
      template: resolve(__dirname, '../src/template/index.pug'),
    }),
    new MiniCSSExtractPlugin({
      filename: 'style.css',
    }),
  ],
};

module.exports = config;
