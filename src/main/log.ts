const log = console.log;

function buildMsg(prefix: string, msg: string): string {
    return prefix + ': [remark-svelte-auto-import] ' + msg;
}

export function warn(msg: string) {
    log(buildMsg('WARN', msg));
}

export function info(msg: string) {
    log(buildMsg('INFO', msg));
}

export function error(msg: string, obj?: any) {
    if (obj) {
        log(buildMsg('ERROR', msg) + JSON.stringify(obj, null, 4));
    } else {
        log(buildMsg('ERROR', msg));
    }
}

export function debug(msg: string, obj?: any) {
    if (obj) {
        log(buildMsg('DEBUG', msg) + JSON.stringify(obj, null, 4));
    } else {
        log(buildMsg('DEBUG', msg));
    }
}

export function debugConfiguration(defaults: any, options: any, effective: any) {
    debug("CONFIG :: Defaults:  ", defaults);
    debug("CONFIG :: Provided:  ", options);
    debug("CONFIG :: Effective: ", effective);
}
