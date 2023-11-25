import test from 'ava';

import { cmBuildComponentMap } from '../main/componentmap';
import { getResource } from './testutils';

const TESTS_BUILD_COMPONENT_MAP = [
    { directories: undefined, patterns: undefined, expected: {} },
    { directories: [], patterns: undefined, expected: {} },
    { directories: undefined, patterns: [], expected: {} },
    { directories: [], patterns: [], expected: {} },
    { directories: ['componentmap/node_modules/module1'], patterns: undefined, expected: {} },
    { directories: ['componentmap/node_modules/module1'], patterns: ['**/*.svelte'], expected: { "Bibo": "bodo", "Fluffy": "bodo", "Gollum": "bodo" } },
    { directories: ['componentmap/node_modules/module1'], patterns: ['**/*.svelte', '**/*.bud'], expected: { "Bibo": "bodo", "Fluffy": "bodo", "Gollum": "bodo", "Simplon": "bodo" } },
    { directories: ['componentmap/node_modules/module3'], patterns: ['**/*.svelte', '**/*.bud'], expected: {} },
    { directories: ['componentmap/node_modules'], patterns: ['**/*.svelte', '**/*.bud'], expected: { "Bibo": "bodo", "Dadaism": "fusco", "Fluffy": "bodo", "Gollum": "bodo", "Simplon": "bodo" } },
];

for (const tc of TESTS_BUILD_COMPONENT_MAP) {
    test(`cmBuildComponentMap(${tc.directories}, ${tc.patterns})`, t => {
        const dirs = tc.directories?.map(dir => getResource(t, dir));
        const map  = cmBuildComponentMap(dirs, tc.patterns)[0];
        t.deepEqual(map, tc.expected);
    });
}
