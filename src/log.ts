import * as vscode from 'vscode';

// const RESET = "\u001b[0m";

// const BOLD = "\u001b[1m";
// const ITALICIZE = "\u001b[3m";
// const UNDERLINE = "\u001b[4m";

// const RED = "\u001b[31m";
// const BLUE = "\u001b[34m";
// const WHITE_CYAN = "\u001b[37;46m";
// const RED_YELLOW = "\u001b[31;43m";
// const PINK = "\u001b[38;5;201m";
// const LAVENDER = "\u001b[38;5;147m";
// const AQUA = "\u001b[38;2;145;231;255m";
// const PENCIL = "\u001b[38;2;253;182;0m";

export const DBG  = 0;
export const INFO = 1;
export const WARN = 2;
export const ERR  = 3;

const levelMap = [
    "dbg  ",
    "info ",
    "warn ",
    "error"
];

export const outputChannel: vscode.OutputChannel = vscode.window.createOutputChannel("GO View PKG", "log");

export function log(level: number, msg: string): void {

    const now = new Date();
    const dt = now.toISOString().split('.').shift();

    const levelStr = levelMap[level];

    outputChannel.appendLine(`${dt} [${levelStr}]: ${msg}`);
    console.log(`${dt}: ${levelStr} ${msg}`);
}