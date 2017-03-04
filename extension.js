var vscode = require("vscode");
var prefixes = require("./prefixes.json");
var config = require("./config.json");

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

    if (female == male)
    {
        message += "Gender neutral";
    } else if (female > male)
    {
        message += "Feminine-coded";
    } else
    {
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

var createColour = function(colour)
{
    return vscode.window.createTextEditorDecorationType({
        backgroundColor: colour
    });
}

function activate(context)
{
    femaleColour = createColour(config.colours.female);
    maleColour = createColour(config.colours.male);

    femaleRegex = prefixArrayToRegex(prefixes.female);
    maleRegex = prefixArrayToRegex(prefixes.male);

    context.subscriptions.push(
        vscode.commands.registerCommand('extension.genderDecode', genderDecode)
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('extension.clearGenderDecode', clearGenderDecode)
    );
}
exports.activate = activate;

function deactivate() {
    clearGenderDecode();
}
exports.deactivate = deactivate;