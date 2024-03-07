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

function parseDebug(val: any): number {
    if (typeof val === 'string') {
        switch (val) {
            case 'None': return Debug.None;
            case 'Default': return Debug.Default;
            case 'RootBefore': return Debug.RootBefore;
            case 'RootAfter': return Debug.RootAfter;
            case 'ScriptBefore': return Debug.ScriptBefore;
            case 'ScriptAfter': return Debug.ScriptAfter;
	    case 'ComponentMap': return Debug.ComponentMap;
            case 'All': return Debug.All;
        }
    }
    // we know from arktype that it's a number
    return val as number;
}
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

