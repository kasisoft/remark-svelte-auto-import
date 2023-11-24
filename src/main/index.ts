import { VFile } from 'vfile';
import { Node, Parent } from 'unist';

import { warn, error, debugConfiguration, debugComponentMap, debug } from './log';
import { imBuildImportText } from './importmap';
import { cmBuildComponentMap } from './componentmap';
import { auAppendScriptText, auGetOrCreateScriptNode } from './astutils';

const NOP = function() {};

export interface RemarkSvelteAutoImportOptions {
    
    debug?             : boolean;
    debugComponentMap? : boolean;
    debugRootBefore?   : boolean;
    debugRootAfter?    : boolean;
    
    /* generate ts lang attribute for non existent script nodes */
    scriptTS?           : boolean;

    /* scan for components */
    directories?       : string[];
    patterns?          : string[];
    
    /* alternatively/additionally provide a mapping between components and modules  */
    componentMap?      : {[component: string]: string};

} /* ENDINTERFACE */

export const DEFAULT_OPTIONS: RemarkSvelteAutoImportOptions = {
    debug               : false,
    debugComponentMap   : false,
    debugRootBefore     : false,
    debugRootAfter      : false,
    scriptTS            : true,
    directories         : [
        'node_modules/'
    ],
    patterns            : [
        '**/*.svelte'
    ]
};

function debugRoot(tree: Node) {
    debug('Markdown Tree:');
    debug(JSON.stringify(tree, null, 4));
}

function collectUsedTags(content: string, tags: string[]): string[] {
    const asSet = new Set<string>(
        tags.filter(tag => (content.indexOf(`<${tag} `) !== -1) || (content.indexOf(`<${tag}>`) !== -1))
    );
    return Array.from(asSet);
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

// https://unifiedjs.com/learn/guide/create-a-plugin/
export function remarkSvelteAutoImport(options: RemarkSvelteAutoImportOptions = DEFAULT_OPTIONS) {

    const config = {...DEFAULT_OPTIONS, ...options};

    // check if we have information to actually create an import list
    if (!hasScanningSettings(config) && !hasComponentMap(config)) {
        error(`You need to specify 'directories' + 'patterns' or 'componentMap'!`);
        debugConfiguration(DEFAULT_OPTIONS, options, config);
        return NOP;
    }

    const componentMap = {...cmBuildComponentMap(config.directories, config.patterns), ...config.componentMap};
    if (config.debug) {
        debugConfiguration(DEFAULT_OPTIONS, options, config);
    }
    if (config.debugComponentMap) {
        debugComponentMap(componentMap);
    }

    if (Object.keys(componentMap).length == 0) {
        warn('Found no components !');
        debugConfiguration(DEFAULT_OPTIONS, options, config);
        return NOP;
    }

    const componentTags = Object.keys(componentMap);

    return function (tree: Parent, file: VFile) {

        if (config.debugRootBefore) {
            debugRoot(tree);
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

        if (config.debugRootAfter) {
            debugRoot(tree);
        }

    }

}
