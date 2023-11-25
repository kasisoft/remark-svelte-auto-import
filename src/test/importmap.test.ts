import test from 'ava';

import { getResource } from './testutils';
import { cmBuildComponentMap } from '../main/componentmap';
import { imBuildImportText } from '../main/importmap';


const TESTS_BUILD_IMPORT_TEXT = [
    { 
        directory: 'importmap/node_modules', 
        patterns: ['**/*.svelte', '**/*.bud'], 
        used: ['Bibo', 'Gollum'],
        expected: "import { Bibo, Gollum } from 'bodo';\n"
    },
    { 
        directory: 'importmap/node_modules', 
        patterns: ['**/*.svelte', '**/*.bud'], 
        used: ['Bibo', 'Dadaism', 'Gollum'],
        expected: "import { Bibo, Gollum } from 'bodo';\nimport { Dadaism } from 'fusco';\n"
    },
];

for (const tc of TESTS_BUILD_IMPORT_TEXT) {
    test(`imBuildImportText(${tc.directory}, ${tc.used})`, t => {
        const componentMap = cmBuildComponentMap([getResource(t, tc.directory)], tc.patterns)[0];
        const importMap    = imBuildImportText(componentMap, tc.used);
        t.is(importMap, tc.expected);
    });
}