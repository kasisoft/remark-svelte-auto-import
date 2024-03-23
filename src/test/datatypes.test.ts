import { expect, test } from 'vitest';

import { Debug, parseDebug } from '$main/datatypes';

const TESTS_PARSE_DEBUG = [

    { value: Debug.None, expected: 0 },
    { value: Debug.Default, expected: 1 },
    { value: Debug.RootBefore, expected: 2 },
    { value: Debug.RootAfter, expected: 4 },
    { value: Debug.ScriptBefore, expected: 8 },
    { value: Debug.ScriptAfter, expected: 16 },
    { value: Debug.ComponentMap, expected: 32 },
    { value: Debug.All, expected: 63 },

    { value: 'None', expected: 0 },
    { value: 'Default', expected: 1 },
    { value: 'RootBefore', expected: 2 },
    { value: 'RootAfter', expected: 4 },
    { value: 'ScriptBefore', expected: 8 },
    { value: 'ScriptAfter', expected: 16 },
    { value: 'ComponentMap', expected: 32 },
    { value: 'All', expected: 63 },

    { value: ['None', 'None'], expected: 0 },
    { value: ['Default', 'Default'], expected: 1 },
    { value: ['RootBefore', 'RootBefore'], expected: 2 },
    { value: ['RootAfter', 'RootAfter'], expected: 4 },
    { value: ['ScriptBefore', 'ScriptBefore'], expected: 8 },
    { value: ['ScriptAfter', 'ScriptAfter'], expected: 16 },
    { value: ['ComponentMap', 'ComponentMap'], expected: 32 },
    { value: ['All', 'All'], expected: 63 },

    { value: ['None', 'Default'], expected: 1 },
    { value: ['Default', 'All'], expected: 63 },
    { value: ['RootBefore', 'RootAfter', 'ScriptBefore'], expected: 14 },

];

for (const tc of TESTS_PARSE_DEBUG) {
    test(`parseDebug(${tc.value})`, () => {
        const debugNum  = parseDebug(tc.value);
        expect(debugNum).toBe(tc.expected);
    });
}
