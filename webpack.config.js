// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

module.exports = {
    mode: 'production',
    entry: [path.join(__dirname, 'src', 'renderer.tsx')],
    externals: [
        '@getflywheel/local/renderer',
        'react',
        '@getflywheel/local-components',
        'react-dom',
        'react-router-dom',
    ],
    devtool: 'source-map',
    target: 'electron-renderer',
    module: {
        rules: [
            {
                test: /\.[tj]sx?$/,
                exclude: [/node_modules/],
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true,
                            configFile: 'tsconfig.json',
                        },
                    },
                ],
            },
            {
                test: /\.svg$/,
                use: [
                    'babel-loader',
                    {
                        loader: 'react-svg-loader',
                        options: {
                            svgo: {
                                plugins: [
                                    {
                                        inlineStyles: {
                                            onlyMatchedOnce: false,
                                        },
                                    },
                                ],
                            },
                        },
                    },
                ],
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: [
                    {
                        loader: 'file-loader',
                    },
                ],
            },
        ],
    },
    node: {
        __dirname: false,
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.jsx', '.js'],
    },
    output: {
        filename: 'renderer.js',
        path: path.join(__dirname, 'lib'),
        libraryTarget: 'commonjs2',
    },
};
