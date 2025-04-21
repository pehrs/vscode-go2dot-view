import { ChildProcess, execSync, exec, ExecException } from "child_process";
import { DBG, ERR, log } from "./log";
import path from "path";

const home = process.env["HOME"];

const viewPkgPath = `${home}/.config/vscode-go2dot-view`;
var go2dotPath = `${viewPkgPath}/go2dot`;
// const go2dotPath = `/home/matti/src/golang/go2dot`;
const imgPath = `${viewPkgPath}/images`;

export async function initGo2Dot(go2dotDirFromConfig: string): Promise<void> {
    var fs = require('fs');

    // "${HOME}/.config/vscode-go2dot-view/go2dot"
    go2dotPath = go2dotDirFromConfig.replace("${HOME}", home as string);

    if (!fs.existsSync(imgPath)) {
        // mkdir -p
        log(DBG, `Image path ${imgPath} does not exist, creating...`);
        fs.mkdirSync(imgPath, {
            recursive: true,
        });
    }

    if (!fs.existsSync(go2dotPath)) {
        // mkdir -p
        log(DBG, `go2dot path ${go2dotPath} does not exist`);

        // Maks sure the parent path exist
        const go2dotParentPath = path.parse(go2dotPath).dir;
        fs.mkdirSync(go2dotParentPath, {
            recursive: true,
        });

        const go2dotRepo = "git@github.com:pehrs/go2dot.git";
        log(DBG, `Cloning ${go2dotRepo}`);
        var cmd = `git clone ${go2dotRepo}`;

        const cloningProcess: ChildProcess = exec(
            cmd,
            {
                cwd: go2dotParentPath
            },
            function (error: ExecException | null, stdout: string | Buffer, stderr: string | Buffer) {
                // Check clone status...
                if (error !== null) {
                    log(ERR, `Exec error: ${error.code}`);
                    log(ERR, `${stderr}`);
                }
                log(DBG, `CLONE ${stdout}`);
            }
        );

        await new Promise((resolve) => {
            cloningProcess.on("exit", resolve);
        });

        return new Promise((resolve) => {
            // 
            // Build 
            // 
            const buildCmd = `go build --ldflags "-X 'pehrs.com/go2dot/cmd.version="vscode-embedded"' -X 'pehrs.com/go2dot/cmd.date=n/a' -X 'pehrs.com/go2dot/cmd.commit=n/a'" -o bin/go2dot main.go`;
            log(DBG, `Building go2dot in ${go2dotPath}`);
            const buildProcess: ChildProcess = exec(
                buildCmd,
                {
                    cwd: go2dotPath,
                },
                function (error: ExecException | null, stdout: string | Buffer, stderr: string | Buffer) {
                    if (error !== null) {
                        log(ERR, `Exec error: ${error.code}`);
                        log(ERR, `${stderr}`);
                    }
                    log(DBG, `BUILD ${stdout}`);
                }
            );
            buildProcess.on("exit", resolve);
        });

    }

    // Return no-op
    return new Promise((resolve) => {
        return resolve();
    });
}

export type Go2DotResponse = {
    imagePath: string | undefined
    error: string
    stderr: string
    stdout: string
}

export async function go2dot(filename: string, format: string, dotCmd: string, showPrivate: boolean, extraOptions: string): Promise<Go2DotResponse> {
    // var execSync = require('child_process').execSync;
    var fs = require('fs');
    var path = require('path');

    const pkgDir = path.dirname(filename);
    const pkgName = path.basename(pkgDir);

    // const options = "-p -x \"-Gsize=4,3 -Gdpi=1000 -Nfontname=\\\"Ubuntu Mono\\\" -Gfontname=\\\"aakar\\\"\"";
    var options = `-T${format} -d ${dotCmd}`;
    if (showPrivate) {
        options += " -p";
    }

    const response: Go2DotResponse = {
        imagePath: undefined,
        error: "",
        stderr: "",
        stdout: "",
    };
    if (fs.existsSync(go2dotPath) && fs.existsSync(imgPath)) {
        const renderedImgPath = `${imgPath}/${pkgName}.${format}`;
        extraOptions = extraOptions.replaceAll("\"", "\\\"",);
        console.log("extraOptions", extraOptions);
        const cmd = `/usr/bin/bash -c '${go2dotPath}/bin/go2dot graph -v ${options} -x \"${extraOptions}\" ${pkgDir} ${renderedImgPath}'`;
        log(DBG, "Running do2cmd");
        log(DBG, cmd);

        const cloningProcess: ChildProcess = exec(
            cmd,
            {
                cwd: viewPkgPath
            },
            function (error: ExecException | null, stdout: string | Buffer, stderr: string | Buffer) {
                // Check clone status...
                if (error !== null) {
                    log(ERR, `Exec error: ${error.code}`);
                    log(ERR, `${stderr}`);
                    response.error = `Exec error: ${error.code}`;
                    response.stderr = stderr.toString();
                }
                log(DBG, `CLONE ${stdout}`);
                response.stdout = stdout.toString();
            }
        );

        await new Promise((resolve) => {
            cloningProcess.on("exit", resolve);
        });

        // try {
        //     const execRes = execSync(cmd, {
        //         cwd: viewPkgPath,
        //     });
        //     response.stdout = `${execRes.toString()}`;
        // } catch (err: any) {
        //     response.error = `Exec error: ${err.status}`;
        //     response.stderr = `${err.stderr.toString()}`;
        // }

        response.imagePath = renderedImgPath;
        return new Promise((resolve) => {
            resolve(response);
        });
    }
    response.error = "Configuration error";
    response.stderr = `PATHS root=${viewPkgPath}, imgPath=${imgPath}`;
    return new Promise((resolve) => {
        resolve(response);
    });
}