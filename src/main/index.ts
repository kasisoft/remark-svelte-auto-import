import { VFile } from 'vfile';
import { Parent } from 'unist';
import path from 'path';

import { warn, error, debug, debugConfiguration } from '$main/log';
import { cmBuildComponentMap } from '$main/componentmap';
import { locateScriptNode } from '$main/astutils';
import { toComponentName, trailingSlash } from '$main/utils';
import { Debug, RemarkSvelteAutoImportOptions } from '$main/datatypes';
import { pluginImpl } from './remarksvelteautoimport';


const NOP = function() {};

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

function debugComponentMap(scanned: any, local: any, config: any, effective: any) {
    debug("COMPONENT MAP :: Scanned: ", scanned);
    debug("COMPONENT MAP :: Local:   ", local);
    debug("COMPONENT MAP :: Config:   ", config);
    debug("COMPONENT MAP :: Effective:   ", effective);
}

function hasScanningSettings(config: RemarkSvelteAutoImportOptions): boolean {
    if (config.directories && config.patterns) {
        return config.directories?.length > 0 && config.patterns?.length > 0;
    }
    return false;
}

function hasComponentMap(config: RemarkSvelteAutoImportOptions): boolean {
    if (config.componentMap) {
        return Object.keys(config.componentMap).length > 0;
    }
    return false;
}

// replicates the supplied mapping while resolving the keys and grating
// trailing slashes for keys and values
function resolveKeyPathes(prefixMapping: {[fspath: string]: string}): {[fspath: string]: string} {
    const result: {[fspath: string]: string} =  {};
    Object.keys(prefixMapping).forEach(fspath => {
        const pathPrefix   = trailingSlash(path.resolve(fspath));
        result[pathPrefix] = trailingSlash(prefixMapping[fspath]);
    });
    return result;
}

function identifyMatchingPrefix(prefixes: string[], componentPath: string): string | null {
    for (let idx in prefixes) {
        const prefix = prefixes[idx];
        if (componentPath.startsWith(prefix)) {
            return prefix;
        }
    }
    return null;
}

function mapLocalComponents(locals: string[], prefixMapping: {[prefix: string]: string}): {[prefix: string]: string} {
    const resolvedMap = resolveKeyPathes(prefixMapping);
    const prefixes    = Object.keys(resolvedMap);
    const result: {[componentName: string]: string} = {};
    locals.forEach(localComponent => {
        const foundPrefix = identifyMatchingPrefix(prefixes, localComponent);
        if (foundPrefix != null) {
            const componentName   = toComponentName(localComponent);
            result[componentName] = resolvedMap[foundPrefix] + localComponent.substring(foundPrefix.length);
        } else {
            warn(`Could not map component '${localComponent}'`);
        }
    });
    return result;
}


// https://unifiedjs.com/learn/guide/create-a-plugin/
export function remarkSvelteAutoImport(options: RemarkSvelteAutoImportOptions = DEFAULT_OPTIONS) {

    const config = {...DEFAULT_OPTIONS, ...options};

    // check if we have information to actually create an import list
    if (!hasScanningSettings(config) && !hasComponentMap(config)) {
        error(`You need to specify 'directories' + 'patterns' or 'componentMap'!`);
        debugConfiguration(DEFAULT_OPTIONS, options, config);
        return NOP;
    }

    const scannedComponents    = cmBuildComponentMap(config.directories, config.patterns);
    const mappedLocals         = mapLocalComponents(scannedComponents[1], config.localComponents ?? {});
    const componentMap         = {...scannedComponents[0], ...mappedLocals, ...config.componentMap};

    if ((config.debug & Debug.Default) != 0) {
        debugConfiguration(DEFAULT_OPTIONS, options, config);
    }
    if ((config.debug & Debug.ComponentMap) != 0) {
        debugComponentMap(scannedComponents, mappedLocals, config.componentMap, componentMap);
    }

    if (Object.keys(componentMap).length == 0) {
        warn('Found no components !');
        debugConfiguration(DEFAULT_OPTIONS, options, config);
        return NOP;
    }

    function logBefore(config: RemarkSvelteAutoImportOptions, tree: Parent) {
        if ((config.debug & Debug.RootBefore) != 0) {
            debug('Markdown Tree (before)', tree);
        }
        if ((config.debug & Debug.ScriptBefore) != 0) {
            debug('Script (before)', locateScriptNode(tree));
        }
    }

    function logAfter(config: RemarkSvelteAutoImportOptions, tree: Parent) {
        if ((config.debug & Debug.ScriptAfter) != 0) {
            debug('Script (after)', locateScriptNode(tree));
        }

        if ((config.debug & Debug.RootAfter) != 0) {
            debug('Markdown Tree (after)', tree);
        }
    }

    return function (tree: Parent, file: VFile) {
        logBefore(config, tree);
        pluginImpl(config, tree, file, componentMap);
        logAfter(config, tree);
    }

}
