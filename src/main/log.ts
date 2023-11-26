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
