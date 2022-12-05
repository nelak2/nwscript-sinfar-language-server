'use strict';

const withDefaults = require('../shared.webpack.config');
const path = require('path');

module.exports = withDefaults({
	context: path.join(__dirname),
	entry: {
		extension: './src/extension.ts',
		gitEditor: './src/editors/git/gitEditor.ts',
	},
	resolve: {
		symlinks: false
	},
	output: {
		filename: '[name].js',
		path: path.join(__dirname, 'out')
	}
});
