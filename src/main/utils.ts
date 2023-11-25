import path from 'path';

export function trailingSlash(input: string): string {
    if (!input.endsWith('/')) {
        return `${input}/`;
    }
    return input;
}

export function containsTag(input: string, tag: string): boolean {
    return (input.indexOf(`<${tag} `) !== -1) || (input.indexOf(`<${tag}>`) !== -1);
}

export function toComponentName(location: string): string {
    let   result   = path.basename(location);
    const lidx     = result.lastIndexOf('.');
    if (lidx != -1) {
        result = result.substring(0, lidx);
    }
    return result;
}

export function isImportedComponent(fspath: string): boolean {
    return fspath.indexOf('node_modules') != -1;
}

export function joinStrings(list: string[], delimiter: string = ', '): string {
    if (list.length == 0) {
        return '';
    }
    if (list.length == 1) {
        return list[0];
    }
    return list.reduce((a, b) => `${a}${delimiter}${b}`);
}