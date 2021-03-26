import fs from "fs";

import webpack, { Configuration } from "webpack";
import { merge } from "webpack-merge";
import common from "./webpack.common.babel.js";

const config: Configuration = {
    mode: "production",
    optimization: {
        minimize: false,
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
};

export default merge(common, config);
