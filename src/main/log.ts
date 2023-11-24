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

export function debug(msg: string) {
    log(chalk.blue(buildMsg(msg)));
}

export function debugConfiguration(defaults: any, options: any, effective: any) {
    debug('--- CONFIGURATION ---');
    debug(":: Defaults:  " + JSON.stringify(defaults));
    debug(":: Provided:  " + JSON.stringify(options));
    debug(":: Effective: " + JSON.stringify(effective));
}

export function debugComponentMap(componentMap: any) {
    debug('--- COMPONENT MAP ---');
    debug(JSON.stringify(componentMap));
}