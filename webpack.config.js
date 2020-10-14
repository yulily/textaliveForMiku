const path = require('path')

module.exports = {
    // モード値を production に設定すると最適化された状態で、
    // development に設定するとソースマップ有効でJSファイルが出力される
    mode: 'development',

    // メインとなるJavaScriptファイル（エントリーポイント）
    entry: './src/main.tsx',

    output: {
        //  出力ファイルのディレクトリ名
        path: `${__dirname}/public/dist`,
        // 出力ファイル名
        filename: 'main.js'
    },

    devServer: {
        contentBase: path.resolve(__dirname, 'public')
    },

    module: {
        rules: [
            {
                // 拡張子 .ts もしくは .tsx の場合
                test: /\.tsx?$/,
                // TypeScript をコンパイルする
                use: [
                    {
                        loader: 'ts-loader',
                    }
                ],
            },
            {
                test: /\.worker\.(c|m)?js$/i,
                use: [
                    { 
                        loader: 'worker-loader' 
                    }
                ],
            },
            // Sassファイルの読み込みとコンパイル
            {
                test: /\.(css|scss|sass)$/,
                use: [
                    // linkタグに出力する機能
                    "style-loader",
                    // CSSをバンドルするための機能
                    {
                        loader: "css-loader",
                        options: {
                            // オプションでCSS内のurl()メソッドの取り込みを禁止する
                            url: false,
                            // ソースマップの利用有無
                            // sourceMap: enabledSourceMap,

                            // 0 => no loaders (default);
                            // 1 => postcss-loader;
                            // 2 => postcss-loader, sass-loader
                            importLoaders: 2
                        }
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            // ソースマップの利用有無
                            // sourceMap: enabledSourceMap
                        }
                    }
                ]
            }
        ]
    },
    // import 文で .ts ファイルを解決するため
    // これを定義しないと import 文で拡張子を書く必要が生まれる。
    // フロントエンドの開発では拡張子を省略することが多いので、
    // 記載したほうがトラブルに巻き込まれにくい。
    resolve: {
        // 拡張子を配列で指定
        extensions: [
            '.ts', '.tsx', '.js', '.json'
        ]
    },
};