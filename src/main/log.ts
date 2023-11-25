import chalk from 'chalk';

const log = console.log;

function buildMsg(msg: string): string {
    return chalk.bold('rsai: ') + msg;
}

export function warn(msg: string) {
    log(chalk.yellow(buildMsg(msg)));
}

export function info(msg: string) {
    log(buildMsg(msg));
}

export function error(msg: string) {
    log(chalk.red(buildMsg(msg)));
}

export function debug(msg: string, obj?: any) {
    if (obj) {
        log(chalk.blue(buildMsg(msg) + JSON.stringify(obj, null, 4)));
    } else {
        log(chalk.blue(buildMsg(msg)));
    }
}

export function debugConfiguration(defaults: any, options: any, effective: any) {
    debug('--- CONFIGURATION ---');
    debug(":: Defaults:  " + JSON.stringify(defaults, null, 4));
    debug(":: Provided:  " + JSON.stringify(options, null, 4));
    debug(":: Effective: " + JSON.stringify(effective, null, 4));
}

export function debugComponentMap(scanned: any, local: any, config: any, effective: any) {
    debug('--- COMPONENT MAP ---');
    debug(":: Scanned: " + JSON.stringify(scanned, null, 4));
    debug(":: Local:   " + JSON.stringify(local, null, 4));
    debug(":: Config:   " + JSON.stringify(config, null, 4));
    debug(":: Effective:   " + JSON.stringify(effective, null, 4));
}