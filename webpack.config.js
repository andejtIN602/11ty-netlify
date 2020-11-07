const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const PostCSSPresetEnv = require('postcss-preset-env');
const ManifestPlugin = require('webpack-manifest-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const isDev = process.env.NODE_ENV !== 'production';

module.exports = {
  mode: isDev ? 'development' : 'production',
  stats: {
    colors: true,
    preset: 'minimal',
    ...(!isDev && { performance: true })
  },
  // Eval does not work for css source maps
  // `All values enable source map generation except eval and false value.`
  // https://github.com/webpack-contrib/css-loader
  devtool: isDev ? 'cheap-module-source-map' : 'source-map',
  entry: [
    path.resolve(__dirname, 'src/assets/scripts/index.js'),
    path.resolve(__dirname, 'src/assets/styles/index.scss')
  ],
  output: {
    filename: isDev ? '[name].js' : '[name].[contenthash].js',
    path: path.resolve(__dirname, '_site/assets'),
    publicPath: '/assets/'
  },
  plugins: [
    new ManifestPlugin(),
    new MiniCssExtractPlugin({
      filename: isDev ? '[name].css' : '[name].[contenthash].css'
    })
  ],
  ...(!isDev && {
    optimization: {
      minimizer: [
        new TerserPlugin(),
        new OptimizeCssAssetsPlugin({
          cssProcessorOptions: { map: true }
        })
      ]
    }
  }),
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.s?css/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: { postcssOptions: { plugins: [PostCSSPresetEnv] } }
          },
          'sass-loader'
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: isDev ? '[name].[ext]' : '[contenthash].[ext]',
              outputPath: 'images'
            }
          }
        ]
      }
    ]
  }
};
