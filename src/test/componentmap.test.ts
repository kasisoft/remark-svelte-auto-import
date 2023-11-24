import test from 'ava';

import { cmBuildComponentMap } from '../main/componentmap';
import { getResource } from './testutils';

const TESTS_BUILD_COMPONENT_MAP = [
    { directories: undefined, patterns: undefined, expected: {} },
    { directories: [], patterns: undefined, expected: {} },
    { directories: undefined, patterns: [], expected: {} },
    { directories: [], patterns: [], expected: {} },
    { directories: ['componentmap/root/module1'], patterns: undefined, expected: {} },
    { directories: ['componentmap/root/module1'], patterns: ['**/*.svelte'], expected: { "Bibo": "bodo", "Fluffy": "bodo", "Gollum": "bodo" } },
    { directories: ['componentmap/root/module1'], patterns: ['**/*.svelte', '**/*.bud'], expected: { "Bibo": "bodo", "Fluffy": "bodo", "Gollum": "bodo", "Simplon": "bodo" } },
    { directories: ['componentmap/root/module3'], patterns: ['**/*.svelte', '**/*.bud'], expected: {} },
    { directories: ['componentmap/root'], patterns: ['**/*.svelte', '**/*.bud'], expected: { "Bibo": "bodo", "Dadaism": "fusco", "Fluffy": "bodo", "Gollum": "bodo", "Simplon": "bodo" } },
];

for (const tc of TESTS_BUILD_COMPONENT_MAP) {
    test(`cmBuildComponentMap(${tc.directories}, ${tc.patterns})`, t => {
        const dirs = tc.directories?.map(dir => getResource(t, dir));
        const map  = cmBuildComponentMap(dirs, tc.patterns);
        t.deepEqual(map, tc.expected);
    });
}
