// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

enum Format {
	UNKNOWN,
	HEX_STRING,
	HEX_STRING_SPACED,
	HEX_STRING_COLON,
	HEX_ARRAY_C,
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "hex-array-formatter" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.hexarrayformat', () => {
		// The code you place here will be executed every time your command is executed

		let activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor) {
			return;
		}

		let texts = activeEditor.selections.map((selection) => activeEditor!.document.getText(selection));
		let format = detectFormat(texts[0]);
		let newTexts: any[];

		switch (format) {
			case Format.UNKNOWN:
				newTexts = texts.map((text) => text.replace(/([0-9-A-Fa-f]{2}):/g, "\$1"));
				newTexts = newTexts.map((text) => text.replace(/([0-9-A-Fa-f]{2})\s/g, "\$1"));
				newTexts = newTexts.map((text) => text.replace(/0[xX]([0-9-A-Fa-f]{2})/g, "\$1"));
				break;

			case Format.HEX_STRING:
				newTexts = texts.map((text) => text.replace(/([0-9-A-Fa-f]{2})/g, "\$1 "));
				newTexts = newTexts.map((text) => text.replace(/ $/g, "")); //remove last space

				break;

			case Format.HEX_STRING_SPACED:
				newTexts = texts.map((text) => text.replace(/([0-9-A-Fa-f]{2})\s/g, "\$1:"));
				newTexts = newTexts.map((text) => text.replace(/:$/g, "")); //remove last colon
				break;

			case Format.HEX_STRING_COLON:
				newTexts = texts.map((text) => text.replace(/([0-9-A-Fa-f]{2}):/g, "0x\$1, "));
				newTexts = newTexts.map((text) => text.replace(/, ([0-9-A-Fa-f]{2})/g, ", 0x\$1"));
				newTexts = newTexts.map((text) => text.replace(/, $/g, "")); //remove last space and comma
				break;

			case Format.HEX_ARRAY_C:
				newTexts = texts.map((text) => text.replace(/\s*,*\s*0[xX]([0-9-A-Fa-f]{2}),*\s*,*/g, "\$1"));

				break;

			default:
				break;
		}

		let i = 0;

		activeEditor.edit((editBuilder) => {
			if (!activeEditor) {
				return;
			}

			activeEditor.selections.map((selection, i) => {
				editBuilder.replace(selection, newTexts[i]);
			});
		});
	});

	context.subscriptions.push(disposable);
}

function detectFormat(hexArrayText: string) {
	//11:22:33:44:55
	if (hexArrayText.length % 2) {
		// odd number of character
		if (hexArrayText.includes(':') && (hexArrayText.match(/:/g) || []).length) {
			//might be a colon separated hex string
		}
		else if (hexArrayText.includes(' ') && (hexArrayText.match(/ /g) || []).length) {
			//might be a space separated hex string
		}
	}
	else {

	}

	if (hexArrayText.match(/0[xX]([0-9-A-Fa-f]{2}),\s/g) !== null
		|| hexArrayText.match(/0[xX]([0-9-A-Fa-f]{2}),/g) !== null) {
		return Format.HEX_ARRAY_C;
	}
	else if (hexArrayText.match(/([0-9-A-Fa-f]{2})\s/g) !== null) {
		return Format.HEX_STRING_SPACED;
	}
	else if (hexArrayText.match(/([0-9-A-Fa-f]{2}):/g) !== null) {
		return Format.HEX_STRING_COLON;
	}
	else if (hexArrayText.match(/([0-9-A-Fa-f]{2})/g) !== null) {
		return Format.HEX_STRING;
	}
	else {
		return Format.UNKNOWN;
	}
}

function changeFormat(input: string, format: Format) {

}

function hex2str(hex : string) {
    var hexs = hex.toString();//force conversion
    var str = '';
	for (var i = 0; (i < hexs.length && hexs.substr(i, 2) !== '00'); i += 2)
	{
		str += String.fromCharCode(parseInt(hexs.substr(i, 2), 16));
	}
    return str;
}

function str2hex(str : string) {
	var arr = [];
	for (var i = 0, l = str.length; i < l; i ++) {
	  var hex = Number(str.charCodeAt(i)).toString(16);
	  arr.push(hex);
	}
	return arr.join('');
  }

// this method is called when your extension is deactivated
export function deactivate() { }
