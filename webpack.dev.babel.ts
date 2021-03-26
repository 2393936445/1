import { Configuration } from "webpack";
import { merge } from "webpack-merge";
import common from "./webpack.common.babel.js";

const config: Configuration = {
    mode: "development",
    devtool: "inline-source-map",
    // @ts-ignore
    devServer: {
        contentBase: "./dist",
        hot: true,
    },
};

export default merge(common, config);
