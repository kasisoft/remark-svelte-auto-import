import { expect } from 'vitest';
import { Parent } from 'unist';
import { unified } from 'unified';
import { fileURLToPath } from 'url';

import markdown from 'remark-parse';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const DIR_RESOURCES = path.resolve(path.join(__dirname, 'resources'));

export function getResource(location: string): string {
    const result = path.join(DIR_RESOURCES, location);
    expect(fs.existsSync(result)).toBe(true);
    return result;
}

export function parseMarkdown(location: string): Parent {
    const file = getResource(location);
    try {
        const fileContent = fs.readFileSync(file, 'utf-8');
        const result      = unified()
            .use(markdown)
            .parse(fileContent)
            ;
        return result;
    } catch (error) {
        const cause = JSON.stringify(error);
        throw(`Failed to load markdown file '${file}'. Cause: ${cause}`);
    }
}
