import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

export default {
    input: "src/main/index.ts",
    output: [
        {
            file: "lib/bundle.esm.js",
            format: "esm",
            sourcemap: "inline"
        }
    ],
    plugins: [
        resolve(),
        typescript({ "tsconfig": "./tsconfig.json", "filterRoot": "src/main" })
    ],
};

