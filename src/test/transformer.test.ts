import { unified } from 'unified'

import remarkFrontmatter from 'remark-frontmatter';
import remarkStringify from 'remark-stringify';
import parse from 'remark-parse'
import fs from 'fs';

import test from 'ava';

import { DEFAULT_OPTIONS, remarkSvelteAutoImport } from '../main';
import { getResource } from './testutils';
import { auLocateScriptNode } from '../main/astutils';

const COMPONENT_MAP = {
    'Gollum': 'dodo',
    'Bibo': 'fusco'
};

const CFG_TS    = { ...DEFAULT_OPTIONS, directories: [], componentMap: COMPONENT_MAP };
const CFG_NO_TS = { ...DEFAULT_OPTIONS, directories: [], scriptTS: false, componentMap: COMPONENT_MAP };

const TESTS_TRANSFORMER_NO_CHANGES = [
    { input: 'transformer/empty.md', config: CFG_TS },
    { input: 'transformer/empty.md', config: CFG_NO_TS },
    { input: 'transformer/just_text.md', config: CFG_TS },
    { input: 'transformer/just_text.md', config: CFG_NO_TS },
    { input: 'transformer/just_text_fm.md', config: CFG_TS },
    { input: 'transformer/just_text_fm.md', config: CFG_NO_TS },
    { input: 'transformer/just_text_unused_ref.md', config: CFG_TS },
    { input: 'transformer/just_text_unused_ref.md', config: CFG_NO_TS },
];

for (const tc of TESTS_TRANSFORMER_NO_CHANGES) {
    test(`transformer without insertion(${tc.input}, ${JSON.stringify(tc.config)})`, t => {

        const mdfile      = getResource(t, tc.input);
        const fileContent = fs.readFileSync(mdfile, 'utf-8');

        const file = unified()
            .use(parse)
            .use(remarkFrontmatter)
            .use(remarkStringify)
            .use(remarkSvelteAutoImport, tc.config)
            .processSync(fileContent)
            ;

        const value = file.value as string;
        t.is(value.indexOf('<script') == -1, true);

    });
}


const TESTS_TRANSFORMER = [
    { input: 'transformer/text_with_one_component.md', config: CFG_TS, expected: '<script lang=\"ts\">\nimport { Gollum } from \'dodo\';\n</script>' },
    { input: 'transformer/text_with_one_component.md', config: CFG_NO_TS, expected: '<script>\nimport { Gollum } from \'dodo\';\n</script>' },
    { input: 'transformer/text_with_multiple_components.md', config: CFG_TS, expected: '<script lang=\"ts\">\nimport { Gollum } from \'dodo\';\nimport { Bibo } from \'fusco\';\n</script>' },
    { input: 'transformer/text_with_multiple_components.md', config: CFG_NO_TS, expected: '<script>\nimport { Gollum } from \'dodo\';\nimport { Bibo } from \'fusco\';\n</script>' }
];

for (const tc of TESTS_TRANSFORMER) {
    test(`transformer with insertion(${tc.input}, ${JSON.stringify(tc.config)})`, t => {

        const mdfile      = getResource(t, tc.input);
        const fileContent = fs.readFileSync(mdfile, 'utf-8');

        const file = unified()
            .use(parse)
            .use(remarkFrontmatter)
            .use(remarkStringify)
            .use(remarkSvelteAutoImport, tc.config)
            .processSync(fileContent)
            ;

        const value = file.value as string;
        t.is(value.indexOf(tc.expected) != -1, true);

    });
}