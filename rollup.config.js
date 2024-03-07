import resolve from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';

export default [
    {
        input: "src/main/index.ts",
        output: [
            {
                file: "lib/bundle.esm.js",
                format: "esm",
                sourcemap: "inline"
            }
        ],
        plugins: [
            alias({
                entries: [
                    { find: '$main', replacement: 'src/main' },
                    { find: '$test', replacement: 'src/test' }
                ]
            }),
            resolve(),
            typescript({ "tsconfig": "./tsconfig.json", "filterRoot": "src/main" }),
            commonjs()
        ],
    },
];
