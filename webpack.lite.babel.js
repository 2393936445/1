import * as fs from "fs";

import webpack from "webpack";
import { merge } from "webpack-merge";
import common from "./webpack.common.babel.js";
import TerserPlugin from "terser-webpack-plugin";

export default merge(common, {
    mode: "production",
    optimization: {
        minimize: false,
        minimizer: [
            new TerserPlugin({
                cache: true,
                parallel: true,
                sourceMap: false,
                terserOptions: {
                    output: {
                        preamble: fs.readFileSync("./docs/LITE/headers.js", "utf8"),
                        comments: false,
                    },
                },
            }),
        ],
    },
    plugins: [
        new webpack.EnvironmentPlugin({
            CRX: false,
            LITE: true,
        }),
        new webpack.BannerPlugin({
            banner: fs.readFileSync("./docs/LITE/headers.js", "utf8"),
            raw: true,
            entryOnly: true,
        }),
    ],
    externals: {
        vue: "Vue",
        $: "jQuery",
        "crypto-js": "CryptoJS",
    },
});
