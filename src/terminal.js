'use strict';

import colors from 'ansi-colors';

const symbols = {
    success: colors.green(colors.symbols.check),
    fail: colors.magenta(colors.symbols.cross),
    info: colors.blueBright(colors.symbols.bullet)
};

class Terminal {
    log(type, msg) {
        process.stderr.write(`${symbols[type] || ' '} ${colors.bold.white(msg)}\n`);
    }

    success(...args) { this.log('success', ...args); }

    error(...args) { this.log('fail', ...args); }

    info(...args) { this.log('info', ...args); }
}

const terminal = new Terminal();

export default terminal;
