// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { initGo2Dot, go2dot } from './go2dot';
import { channel } from 'diagnostics_channel';
import { log, INFO, ERR, DBG } from './log';


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	log(INFO, `vscode-go2dot-view: version: 1.0`);

	const viewPkgCmd = vscode.commands.registerCommand('vscode-go2dot-view.view-package', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user

		const config = vscode.workspace.getConfiguration('goViewPkg');
		const go2DotDir = config.get("go2DotDir") as string;

		// Make sure we are inited...
		initGo2Dot(go2DotDir)
			.then(() => {

				log(DBG, "init done let's create image...")

				const dotCmd = config.get("dotCmd") as string;
				const showPrivate = config.get("showPrivate") as boolean;
				const extraOptions = config.get("extraOptions") as string;
				const format = config.get("format") as string;

				if (vscode.window.activeTextEditor !== undefined) {
					// const uri = vscode.window.activeTextEditor.document.uri;
					const fn = vscode.window.activeTextEditor.document.fileName;

					if (fn.endsWith(".go")) {
						go2dot(fn, format, dotCmd, showPrivate, extraOptions)
							.then((imgRes) => {
								if (imgRes.error) {
									// const message = `vscode-go2dot-view: error: ${imgRes.error}\n${imgRes.stdout}\n${imgRes.stderr}`;
									// vscode.window.showErrorMessage(message);
									log(ERR, `Error when running go2dot:\n${imgRes.error}\n${imgRes.stdout}\n${imgRes.stderr}`);
									return;
								}
								if (imgRes.imagePath) {
									const img = vscode.Uri.parse(`file://${imgRes.imagePath}`);
									console.log("URI", img);
									vscode.commands.executeCommand('vscode.open', img);

									const message = `image generated: ${imgRes.imagePath}`;
									// vscode.window.showInformationMessage(message);
									log(INFO, message);
								}
							});
					} else {
						vscode.window.showErrorMessage(`File ${fn} is not golang! Please open a golang file and re-run the action.`);
					}
				}
			});

	});

	context.subscriptions.push(viewPkgCmd);
}

// This method is called when your extension is deactivated
export function deactivate() { }
