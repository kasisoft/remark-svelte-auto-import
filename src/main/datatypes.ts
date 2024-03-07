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

