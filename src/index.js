'use strict';

import fs from 'fs';
import os from 'os';
import path from 'path';
import tmp from 'tmp';
import aesjs from 'aes-js';
import sqlite from 'sqlite';
import bt from 'ibackuptool';
import { prompt } from 'inquirer';
import terminal from './terminal';
import { drawDevices } from './table';

tmp.setGracefulCleanup();

const dir = `/Users/${os.userInfo().username}/Library/Application Support/MobileSync/Backup/`;

const fields = [
    { name: 'Name', key: 'ZNAME' },
    { name: 'Model', key: 'ZMODEL' },
    { name: 'IP', key: 'ZLOCALIP' },
    { name: 'MAC', key: 'ZMAC' },
    { name: 'Firmware', key: 'ZEXTFWVERSION' },
    { name: 'SSID', key: 'ZSSID' },
    { name: 'Token', key: 'ZTOKEN' }
];

const sql = `SELECT ${fields.map(({ key }) => key).join(',')} FROM ZDEVICE`;

const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: false
});

!async function() {
    // Check for permissions
    try {
        fs.readdirSync(dir, { encoding: 'utf8' });
    } catch (err) {
        if (err.code === 'EPERM') {
            [
                'It seems your terminal app has no access to the backups folder.',
                'To fix this just grant full disk access to the terminal app:',
                ' → System Preferences → Security & Privacy → "Privacy" tab → select "Full Disk Access"',
                'And then click the [+] plus button to add the terminal app.'
            ]
                .forEach(str => terminal.error(str));

            process.exit(1);
        } else {
            throw new Error(err);
        }
    }

    const list = (await bt.run('backups.list')).filter(({ encrypted }) => !encrypted);

    if (list.length === 0) {
        terminal.info('You have no unencrypted backups');
        process.exit(0);
    }

    const { udid } = await prompt([
        {
            type: 'list',
            name: 'udid',
            message: 'Choose backup to inspect (only unencrypted backups are displayed):',
            choices: list.map(({ udid, deviceName, date, iOSVersion }) => ({
                name: `${deviceName} (iOS ${iOSVersion} / ${formatter.format(new Date(date))})`,
                short: deviceName,
                value: udid
            }))
        }
    ]);

    tmp.dir({ mode: 0o755 }, async (err, dir, cleanupCallback) => {
        if (err) throw err;

        let files = await bt.run('backup.files', {
            backup: udid,
            extract: dir,
            filter: '_mihome'
        });

        files = files.filter(({ path }) => /_mihome/.test(path));

        if (files.length > 0) {
            await readDB(path.resolve(dir, files[0].domain, files[0].path));
        } else {
            terminal.info('There is no MiHome database files in the backup');
        }

        cleanupCallback();
    });
}();

async function readDB(filename) {
    let db = await sqlite.open(filename),
        devices = await db.all(sql),
        key = Array(16).fill(0x0);

    devices.forEach(item => {
        if (!item.ZTOKEN || item.ZTOKEN.length !== 96) return;

        let decrypted = new aesjs.ModeOfOperation.ecb(key).decrypt(aesjs.utils.hex.toBytes(item.ZTOKEN));

        decrypted = aesjs.utils.utf8.fromBytes(decrypted).slice(0, 32);

        item.ZTOKEN = `${decrypted} (decrypted)`;
    });

    drawDevices(devices, fields);
}
