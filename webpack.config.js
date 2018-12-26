const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const config = require('sapper/config/webpack.js');
const pkg = require('./package.json');

const mode = process.env.NODE_ENV;
const isDev = mode === 'development';

module.exports = {
	client: {
		entry: config.client.entry(),
		output: config.client.output(),
		resolve: {
			extensions: ['.js', '.json', '.html'],
			mainFields: ['svelte', 'module', 'browser', 'main']
		},
		module: {
			rules: [
				{
					test: /\.html$/,
					use: {
						loader: 'svelte-loader',
						options: {
							isDev,
							hydratable: true,
							hotReload: true
						}
					}
				},
				{
        test: /\.css$/,
        use: [
          isDev
            ? { loader: 'style-loader', options: { sourceMap: true }} // CSS HMR
            : MiniCssExtractPlugin.loader, // extract CSS in production builds
          { loader: 'css-loader', options: { sourceMap: isDev }},
          //{ loader: 'postcss-loader', options: { sourceMap: isDev }},
        ],
      },
			]
		},
		mode,
		plugins: [
    isDev && new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.browser': true,
      'process.env.NODE_ENV': JSON.stringify(mode),
    }),

    new MiniCssExtractPlugin({
      filename: '[hash]/[name].css',
      chunkFilename: '[hash]/[name].[id].css',
    }),
  ].filter(Boolean),
  ...(isDev ? {} : { optimization: {
    // combine all CSS into a single file
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'main',
          test: /\.css$/,
          chunks: 'all',
          enforce: true,
        },
      },
    },
  }}),
  devtool: isDev && 'eval-source-map',
	},

	server: {
		entry: config.server.entry(),
		output: config.server.output(),
		target: 'node',
		resolve: {
			extensions: ['.js', '.json', '.html'],
			mainFields: ['svelte', 'module', 'browser', 'main']
		},
		externals: Object.keys(pkg.dependencies).concat('encoding'),
		module: {
			rules: [
				{
					test: /\.html$/,
					use: {
						loader: 'svelte-loader',
						options: {
							css: false,
							generate: 'ssr',
							isDev
						}
					}
				}
			]
		},
		mode: process.env.NODE_ENV,
		performance: {
			hints: false // it doesn't matter if server.js is large
		}
	},

	serviceworker: {
		entry: config.serviceworker.entry(),
		output: config.serviceworker.output(),
		mode: process.env.NODE_ENV
	}
};
