import { Parent } from 'unist';
import { Literal } from 'unist';

export type NullableString = string | null;

export type NullableLiteral = Literal | null;

// component name => module name
export type ComponentMap = {[component: string]: string};

// package.json path => extracted package name or null
export type ModuleMap    = {[packageFile: string]: NullableString};

// module name => list of component names
export type ImportMap = {[module: string]: string[]};


export enum Debug {
    None         = 0,
    Default      = 1 << 0,
    RootBefore   = 1 << 1,
    RootAfter    = 1 << 2,
    ScriptBefore = 1 << 3,
    ScriptAfter  = 1 << 4,
    ComponentMap = 1 << 5,
    All          = Default | RootBefore | RootAfter | ComponentMap
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

export function remarkSvelteAutoImport(options?: RemarkSvelteAutoImportOptions): (tree: Parent) => void;

