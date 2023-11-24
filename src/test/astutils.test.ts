import test from 'ava';

import { auAppendScriptText, auGetOrCreateScriptNode } from '../main/astutils';
import { parseMarkdown } from './testutils';


const TESTS_GET_OR_CREATE_SCRIPT = [
    
    /* option ts has no meaning here as we're reusing a script node */
    { location: 'existing_script_1.md', ts: true, expected: '<script/>'},
    { location: 'existing_script_2.md', ts: true, expected: '<script lang="ts"/>'},
    { location: 'existing_script_3.md', ts: true, expected: '<script></script>'},
    { location: 'existing_script_4.md', ts: true, expected: '<script lang="ts"></script>'},

    /* setup our script node to match our needs */
    { location: 'missing_script.md', ts: true, expected: '<script lang="ts"></script>'},
    { location: 'missing_script.md', ts: false, expected: '<script></script>'},

];

for (const tc of TESTS_GET_OR_CREATE_SCRIPT) {
    test(`auGetOrCreateScriptNode(${tc.location}, ts: ${tc.ts})`, t => {
        const tree       = parseMarkdown(t, `astutils/${tc.location}`);
        const scriptNode = auGetOrCreateScriptNode(tree, tc.ts);
        t.is((scriptNode.value as string).trim(), tc.expected);
    });
}


const TESTS_APPEND_SCRIPT_TEXT = [
    { location: 'existing_script_1.md', ts: true, text: 'bibo', expected: '<script>\nbibo</script>' },
    { location: 'existing_script_2.md', ts: true, text: 'bibo', expected: '<script lang="ts">\nbibo</script>' },
    { location: 'existing_script_3.md', ts: true, text: 'bibo', expected: '<script>\nbibo</script>' },
    { location: 'existing_script_4.md', ts: true, text: 'bibo', expected: '<script lang="ts">\nbibo</script>' },
    { location: 'missing_script.md', ts: true, text: 'bibo', expected: '<script lang="ts">\nbibo</script>' },
    { location: 'missing_script.md', ts: false, text: 'bibo', expected: '<script>\nbibo</script>' },
];

for (const tc of TESTS_APPEND_SCRIPT_TEXT) {
    test(`auAppendScriptText(${tc.location}, ${tc.text}, ${tc.ts})`, t => {
        const tree       = parseMarkdown(t, `astutils/${tc.location}`);
        const scriptNode = auGetOrCreateScriptNode(tree, tc.ts);
        auAppendScriptText(scriptNode, tc.text);
        t.is((scriptNode.value as string).trim(), tc.expected);
    });
}
