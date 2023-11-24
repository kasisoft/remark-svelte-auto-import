import glob from 'fast-glob';
import path from 'path';
import fs from 'fs';
import { warn } from "./log";

type NullableString = string | null;

// component name => module name
type ComponentMap = {[component: string]: string};

// package.json path => extracted package name or null
type ModuleMap    = {[packageFile: string]: NullableString};

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

function cmListComponents(patterns: string[], dir: string, moduleMap: ModuleMap, componentMap: ComponentMap) {
    glob.sync(patterns, {cwd: dir, onlyFiles: true, absolute: true}).forEach((location: string) => {
        const packageJson = cmFindPackageJson(path.dirname(location));
        if (packageJson != null) {
            const moduleName  = cmGetOrAddName(packageJson, moduleMap);
            if (moduleName != null) {
                const basename = path.basename(location);
                const lidx     = basename.lastIndexOf('.');
                if (lidx != -1) {
                    const componentName = basename.substring(0, lidx);
                    componentMap[componentName] = moduleName;
                }
            }
        }
    });
}

export function cmBuildComponentMap(directories?: string[], patterns?: string[]): ComponentMap {
    if (directories && patterns) {
        const result    : ComponentMap = {};
        const moduleMap : ModuleMap    = {};
        directories?.forEach(dir => cmListComponents(patterns as string[], dir, moduleMap, result));
        return result;
    }
    return {};
}