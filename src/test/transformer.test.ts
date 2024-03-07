import { expect, test } from 'vitest';
import { unified } from 'unified'

import remarkFrontmatter from 'remark-frontmatter';
import remarkStringify from 'remark-stringify';
import parse from 'remark-parse'
import fs from 'fs';

import { remarkSvelteAutoImport } from '$main/index';
import { Debug, RemarkSvelteAutoImportOptions } from '$main/datatypes';
import { getResource } from '$test/testutils';

const DEFAULT_OPTIONS: RemarkSvelteAutoImportOptions = {
    debug               : Debug.None,
    scriptTS            : true,
    directories         : [
        'node_modules/'
    ],
    patterns            : [
        '**/*.svelte'
    ]
};

const COMPONENT_MAP = {
    'Gollum': 'dodo',
    'Bibo': 'fusco'
};

// returns the script tag and it's content
function runTransformer(location: string, config: RemarkSvelteAutoImportOptions): string {
    const mdfile      = getResource(location);
    const fileContent = fs.readFileSync(mdfile, 'utf-8');
    const vfile = unified()
        .use(parse)
        .use(remarkFrontmatter)
        .use(remarkStringify)
        .use(remarkSvelteAutoImport, config)
        .processSync(fileContent)
        ;
    const value = vfile.value as string;
    const open  = value.indexOf('<script');
    const close = value.indexOf('</script>');
    if ((open == -1) || (close == -1)) {
        return '';
    } else {
        return value.substring(open, close + '</script>'.length);
    }
}

function cfg(scriptTS?: boolean, cm?: {[component: string]: string}, dirs?: string[], locals?: {[component: string]: string}): RemarkSvelteAutoImportOptions {
    let result: RemarkSvelteAutoImportOptions = { ...DEFAULT_OPTIONS };
    if (scriptTS != undefined) {
        result = { ...result, scriptTS: scriptTS };
    }
    if (cm) {
        result = { ...result, componentMap: cm };
    }
    if (dirs) {
        result = { ...result, directories: dirs };
    }
    if (locals) {
        result = { ...result, localComponents: locals };
    }
    return result;
}

const TESTS_TRANSFORMER_NO_CHANGES = [
    { input: 'transformer/empty.md', ts: true },
    { input: 'transformer/empty.md', ts: false },
    { input: 'transformer/just_text.md', ts: true },
    { input: 'transformer/just_text.md', ts: false },
    { input: 'transformer/just_text_fm.md', ts: true },
    { input: 'transformer/just_text_fm.md', ts: false },
    { input: 'transformer/just_text_unused_ref.md', ts: true },
    { input: 'transformer/just_text_unused_ref.md', ts: false },
];

for (const tc of TESTS_TRANSFORMER_NO_CHANGES) {
    test(`no insertions(${tc.input}, ${tc.ts})`, () => {
        const config = cfg(tc.ts);
        const value  = runTransformer(tc.input, config);
        expect(value).toBe('');
    });
}

const TESTS_TRANSFORMER = [
    { input: 'transformer/text_with_one_component.md', ts: true, expected: '<script lang=\"ts\">\nimport { Gollum } from \'dodo\';\n</script>' },
    { input: 'transformer/text_with_one_component.md', ts: false, expected: '<script>\nimport { Gollum } from \'dodo\';\n</script>' },
    { input: 'transformer/text_with_multiple_components.md', ts: true, expected: '<script lang=\"ts\">\nimport { Gollum } from \'dodo\';\nimport { Bibo } from \'fusco\';\n</script>' },
    { input: 'transformer/text_with_multiple_components.md', ts: false, expected: '<script>\nimport { Gollum } from \'dodo\';\nimport { Bibo } from \'fusco\';\n</script>' }
];

for (const tc of TESTS_TRANSFORMER) {
    test(`with insertion(${tc.input}, ${tc.ts})`, () => {
        const config = cfg(tc.ts, COMPONENT_MAP, []);
        const value  = runTransformer(tc.input, config);
        expect(value).toBe(tc.expected);
    });
}

const TESTS_TRANSFORMER_NODE_MODULES = [
    { input: 'transformer/text_with_one_component.md', ts: true, expected: '<script lang=\"ts\">\nimport { Gollum } from \'bodo\';\n</script>' },
    { input: 'transformer/text_with_one_component.md', ts: false, expected: '<script>\nimport { Gollum } from \'bodo\';\n</script>' },
    { input: 'transformer/text_with_multiple_components.md', ts: true, expected: '<script lang=\"ts\">\nimport { Bibo, Gollum } from \'bodo\';\n</script>' },
    { input: 'transformer/text_with_multiple_components.md', ts: false, expected: '<script>\nimport { Bibo, Gollum } from \'bodo\';\n</script>' }
];

for (const tc of TESTS_TRANSFORMER_NODE_MODULES) {
    test(`transformer with node_modules(${tc.input}, ${tc.ts})`, () => {
        const dirs   = [getResource('transformer/node_modules')];
        const config = cfg(tc.ts, {}, dirs);
        const value  = runTransformer(tc.input, config);
        expect(value).toBe(tc.expected);
    });
}

const TESTS_TRANSFORMER_LOCALS = [
    { input: 'transformer/text_with_local_components.md', ts: true, expected: '<script lang=\"ts\">\nimport Tamborin from \'$lib/local/Tamborin.svelte\';\nimport Elephant from \'$lib/local/localsub1/Elephant.svelte\';\n</script>' },
    { input: 'transformer/text_with_local_components.md', ts: false, expected: '<script>\nimport Tamborin from \'$lib/local/Tamborin.svelte\';\nimport Elephant from \'$lib/local/localsub1/Elephant.svelte\';\n</script>' },
];

for (const tc of TESTS_TRANSFORMER_LOCALS) {
    const locals = {
        'src/test/resources/transformer/local': '$lib/local/'
    };
    test(`transformer with node_modules, locals(${tc.input}, ${tc.ts})`, () => {
        const dirs   = [ getResource('transformer/local'), getResource('transformer/node_modules') ];
        const config = cfg(tc.ts, {}, dirs, locals);
        const value  = runTransformer(tc.input, config);
        expect(value).toBe(tc.expected);
    });
}

const TESTS_TRANSFORMER_LOCALS_OVERRIDE = [
    { input: 'transformer/text_with_local_components.md', ts: true, expected: '<script lang=\"ts\">\nimport Tamborin from \'$lib/local/Tamborin.svelte\';\nimport { Elephant } from \'@animals\';\n</script>' },
    { input: 'transformer/text_with_local_components.md', ts: false, expected: '<script>\nimport Tamborin from \'$lib/local/Tamborin.svelte\';\nimport { Elephant } from \'@animals\';\n</script>' },
];

for (const tc of TESTS_TRANSFORMER_LOCALS_OVERRIDE) {
    const locals = {
        'src/test/resources/transformer/local': '$lib/local/'
    };
    test(`transformer with node_modules, locals and config(${tc.input}, ${tc.ts})`, () => {
        const dirs   = [ getResource('transformer/local'), getResource('transformer/node_modules') ];
        const cm     = { 'Elephant': '@animals' };
        const config = cfg(tc.ts, cm, dirs, locals);
        const value  = runTransformer(tc.input, config);
        expect(value).toBe(tc.expected);
    });
}
