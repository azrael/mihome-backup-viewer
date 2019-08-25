## Intro
As an iOS user, when you are building a smart home with the [homebridge](https://github.com/nfarina/homebridge), you have to fill in
the Homebridge config with some information like a local IP or token of your smart devices.
In most cases, the [miIO device library](https://github.com/aholstenson/miio) can help you to obtain this
information.

But sometimes miIO can't extract the token, or an extracted token is invalid, or even miIO does not
see the device at all. In this case, you can get the needed information from the `Mi Home` app by following
[this steps](https://github.com/jghaanstra/com.xiaomi-miio/blob/master/docs/obtain_token.md#ios-users).
But this instruction is complex. So here is `mihome-backup-viewer`! This tool executes these steps for
you. All you need is:

- create an unencrypted iOS backup;
- run `mihome-backup-viewer` and follow the instructions;
- copy and paste the desired information.

## Install

Install it globally:

```bash
npm i -g mihome-backup-viewer
```

## How to use

Just run this command and follow the instructions:

```bash
mihome-backup-viewer
```

## Troubleshooting

- Make sure you creating an unencrypted backup.
- Make sure your terminal app has permissions to read the backups folder:
 → System Preferences → Security & Privacy → "Privacy" tab → select "Full Disk Access",
and then click the [+] plus button to add the terminal app.
