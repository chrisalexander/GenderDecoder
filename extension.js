var vscode = require("vscode");
var config = require("./prefixes.json");

var femaleColour = null;
var maleColour = null;

var femaleRegex = null;
var maleRegex = null;

var applyAndCountColours = function(editor, colour, regex)
{
    var allText = editor.document.getText();

    var toApply = [];

    var match;
    while ((match = regex.exec(allText)) !== null)
    {
        var start = editor.document.positionAt(match.index);
        var end = editor.document.positionAt(match.index + match[0].length);

        var decoration = {
            range: new vscode.Range(start, end)
        }

        toApply.push(decoration);
    }

    editor.setDecorations(colour, toApply);

    return toApply.length;
}

var genderDecode = function()
{
    var editor = vscode.window.activeTextEditor;
    if (!editor)
    {
        return;
    }

    var female = applyAndCountColours(editor, femaleColour, femaleRegex);
    var male = applyAndCountColours(editor, maleColour, maleRegex);

    var message = "";

    if (female == male) {
        message += "Gender neutral";
    } else if (female > male) {
        message += "Feminine-coded";
    } else {
        message += "Masculine-coded";
    }

    message += ": " + female + " feminine-coded words, " + male + " masculine-coded words";

    vscode.window.showInformationMessage(message);
}

var clearGenderDecode = function()
{
    var editor = vscode.window.activeTextEditor;
    if (!editor)
    {
        return;
    }

    editor.setDecorations(femaleColour, []);
    editor.setDecorations(maleColour, []);
}

var prefixArrayToRegex = function(prefixArray)
{
    // e.g. \b((?:commu.+?)|(?:collab.+?))\b
    return new RegExp("\\b((?:" +  prefixArray.join(".*?)|(?:") + ".*?))\\b", "ig");
}

function activate(context)
{
    femaleColour = vscode.window.createTextEditorDecorationType({
        backgroundColor: "#fa72ff"
    });
    maleColour = vscode.window.createTextEditorDecorationType({
        backgroundColor: "#4f91ff"
    });

    femaleRegex = prefixArrayToRegex(config.female);
    maleRegex = prefixArrayToRegex(config.male);

    var disposable = vscode.commands.registerCommand('extension.genderDecode', genderDecode);
    context.subscriptions.push(disposable);

    var disposable = vscode.commands.registerCommand('extension.clearGenderDecode', clearGenderDecode);
    context.subscriptions.push(disposable);
}
exports.activate = activate;

function deactivate() {
}
exports.deactivate = deactivate;