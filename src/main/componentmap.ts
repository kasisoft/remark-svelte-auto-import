import glob from 'fast-glob';
import path from 'path';
import fs from 'fs';

import { warn } from '$main/log';
import { isImportedComponent, toComponentName } from '$main/utils';
import { ModuleMap, NullableString } from '$main/datatypes';

function cmReadJson(file: string): any {
    try {
        const fileContent = fs.readFileSync(file, 'utf-8');
        return JSON.parse(fileContent);
    } catch (err) {
        warn(`Failed to load the package declaration in '${file} !`);
        return {};
    }
}

function cmGetOrAddName(packageJson: string, moduleMap: ModuleMap): NullableString {
    if (!moduleMap.hasOwnProperty(packageJson))  {
        moduleMap[packageJson] = cmReadJson(packageJson)['name'] ?? null;
    }
    return moduleMap[packageJson];
}

function cmFindPackageJson(dir: string): NullableString {
    const candidate = path.resolve(path.join(dir, 'package.json'));
    if (fs.existsSync(candidate)) {
        return candidate;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
        // stop on root
        return null;
    }
    // check the parent dir
    return cmFindPackageJson(parent);
}

function cmListComponents(patterns: string[], dir: string, moduleMap: ModuleMap, componentMap: ComponentMap, localComponents: string[]) {

    const matchingFiles     = glob.sync(patterns, {cwd: dir, onlyFiles: true, absolute: true});
    matchingFiles.filter(file => !isImportedComponent(file)).forEach(file => localComponents.push(file));

    const importCandidates  = matchingFiles.filter(file => isImportedComponent(file));
    importCandidates.forEach(file => {
        const packageJson = cmFindPackageJson(path.dirname(file));
        if (packageJson != null) {
            const moduleName = cmGetOrAddName(packageJson, moduleMap);
            if (moduleName != null) {
                const componentName = toComponentName(file);
                componentMap[componentName] = moduleName;
            }
        }
    });

}

export function cmBuildComponentMap(directories?: string[], patterns?: string[]): [ComponentMap, string[]] {
    if (directories && patterns) {
        const result    : ComponentMap = {};
        const moduleMap : ModuleMap    = {};
        const locals    : string[]     = [];
        directories?.forEach(dir => cmListComponents(patterns as string[], dir, moduleMap, result, locals));
        return [result, locals];
    }
    return [{}, []];
}
