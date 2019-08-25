'use strict';

/* Box drawing symbols
* https://en.wikipedia.org/wiki/Box-drawing_character
* ─ │ ┌ ┐ └ ┘
* ├ ┤ ┬ ┴ ┼
* ╭ ╮ ╯ ╰ ╱ ╲
* ╴ ╵ ╶ ╷ ×
*/

import terminal from './terminal';

const write = msg => terminal.log(null, msg);

export function drawDevices(rows, head) {
    let sizes;

    sizes = head.map(({ name, key }) => [name, ...rows.map(item => item[key])]
        .sort((a, b)=> (b || '').length - (a || '').length)[0].length + 2
    );

    terminal.success('There are your devices:');
    write(`┌${sizes.map(n => '─'.repeat(n)).join('┬')}┐`);
    write(`│${head.map((v, i) => ` ${v.name}${' '.repeat(sizes[i] - v.name.length - 1)}`).join('│')}│`);
    rows.forEach(row => {
        write(`├${sizes.map(n => '─'.repeat(n)).join('┼')}┤`);

        let line = '│' + head.map((v, i) => {
            let value = row[v.key] || '';

            return ` ${value}${' '.repeat(sizes[i] - value.length - 1)}`;
        }).join('│') + '│';

        write(line);
    });
    write(`└${sizes.map(n => '─'.repeat(n)).join('┴')}┘`);
}
