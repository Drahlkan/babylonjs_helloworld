const path = require('path'); 
const Webpack = require('webpack');
// creates index.html file by a template index.ejs
const HtmlWebpackPlugin = require('html-webpack-plugin');
// cleans dist folder
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
// copies the assets folder into dist folder
const CopyWebpackPlugin = require('copy-webpack-plugin'); 
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const distFolder = './dist';

  module.exports = {
    mode: 'development',
    entry: './src/app.ts', 
    output: {
      filename: 'js/[name].js',
      path: path.resolve(__dirname, distFolder),
    }, 
    devtool: 'inline-source-map',
    plugins: [
      require('autoprefixer'),
      new MiniCssExtractPlugin({
        filename: "css/[name].css"
      }),
      new Webpack.HotModuleReplacementPlugin(), 
      new CleanWebpackPlugin(),  
      new HtmlWebpackPlugin({ 
        inject: true,
        template: './src/index.html'
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: 'src/assets/textures', to: 'assets/textures' },
          { from: 'src/assets/models', to: 'assets/models' },
          { from: "src/style", to: "style" }
        ]
      })
    ],
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader?importLoaders=1',
            'postcss-loader'
          ]
        },
        {
          test: /\.less$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader?importLoaders=1',
            'postcss-loader',
            'less-loader'
          ]
        },
        {
            test: /\.woff($|\?)|\.woff2($|\?)|\.ttf($|\?)|\.eot($|\?)|\.svg($|\?)/,
            use: "url-loader"
        },
        {
            test:/\.(png|jpg|gif)$/,
            use:[{
                loader:'url-loader',
                options:{
                    limit:50000, 
                    outputPath:'images'
                }
            }]
        }

      ]
    },
    resolve: {
      extensions: [ '.tsx', '.ts', '.js', ".css", ".less" ]
    },
    devServer: {
      host:"0.0.0.0",
      port: 8080,
      static: "./assets/",
      hot:true,
      devMiddleware: {
        publicPath: "/",
      }
    }, 
    optimization: {
      splitChunks: {
          cacheGroups: {
              commons: {
                  test: /[\\/]node_modules[\\/]/,
                  name: "vendors",
                  chunks: "all"
              }
          }
      }
    },
    externals: {
      "oimo": true,
      "cannon": true,
      "earcut": true
    },
  };

