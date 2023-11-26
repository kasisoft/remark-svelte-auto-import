import { VFile } from 'vfile';
import { Node, Parent } from 'unist';
import path from 'path';

import { warn, error, debug } from './log';
import { imBuildImportText } from './importmap';
import { cmBuildComponentMap } from './componentmap';
import { auAppendScriptText, auGetOrCreateScriptNode } from './astutils';
import { containsTag, toComponentName, trailingSlash } from './utils';

const NOP = function() {};

export enum Debug {

    None         = 0,
    Default      = 1 << 0,
    ComponentMap = 1 << 1,
    RootBefore   = 1 << 2,
    RootAfter    = 1 << 3,
    All          = Default | ComponentMap | RootBefore | RootAfter

} /* ENDENUM */

export interface RemarkSvelteAutoImportOptions {
    
    debug               : Debug;
    
    /* generate ts lang attribute for non existent script nodes */
    scriptTS?           : boolean;

    /* scan for components */
    directories?       : string[];
    patterns?          : string[];
    
    /* alternatively/additionally provide a mapping between components and modules  */
    componentMap?      : {[component: string]: string};

    /* mapping for local components (unless mapped in componentMap) */
    localComponents?   : {[pathprefix: string]: string};

} /* ENDINTERFACE */

export const DEFAULT_OPTIONS: RemarkSvelteAutoImportOptions = {
    debug               : Debug.None,
    scriptTS            : true,
    directories         : [
        'node_modules/'
    ],
    patterns            : [
        '**/*.svelte'
    ]
};

function debugConfiguration(defaults: any, options: any, effective: any) {
    debug("CONFIG :: Defaults:  ", defaults);
    debug("CONFIG :: Provided:  ", options);
    debug("CONFIG :: Effective: ", effective);
}

function debugComponentMap(scanned: any, local: any, config: any, effective: any) {
    debug("COMPONENT MAP :: Scanned: ", scanned);
    debug("COMPONENT MAP :: Local:   ", local);
    debug("COMPONENT MAP :: Config:   ", config);
    debug("COMPONENT MAP :: Effective:   ", effective);
}

function collectUsedTags(content: string, tags: string[]): string[] {
    return Array.from(new Set<string>(tags.filter(tag => containsTag(content, tag))));
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

    const componentTags = Object.keys(componentMap);

    return function (tree: Parent, file: VFile) {

        if ((config.debug & Debug.RootBefore) != 0) {
            debug('Markdown Tree (before)', tree);
        }

        /** 
         * @todo [24-NOV-2023:KASI]   Figure out a proper way to access the textual 
         *                            content. I might not have a grasp yet on the
         *                            remark/unified infrastructure though this
         *                            seems to work fine for now.
         */
        let content = '';
        if (file.hasOwnProperty('contents')) {
            content = (file as any)['contents'];
        } else if (file.hasOwnProperty('value')) {
            content = file.value as string;
        }
        
        if (content.length == 0) {
            return;
        }

        const usedComponents = collectUsedTags(content, componentTags);
        if (usedComponents.length == 0) {
            // none of our registered components is being used, so no changes necessary
            return;
        }

        const scriptNode = auGetOrCreateScriptNode(tree, config.scriptTS ?? false);
        auAppendScriptText(scriptNode, imBuildImportText(componentMap, usedComponents));

        if ((config.debug & Debug.RootAfter) != 0) {
            debug('Markdown Tree (after)', tree);
        }

    }

}
