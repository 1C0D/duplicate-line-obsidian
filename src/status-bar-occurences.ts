import { debounce } from "obsidian";
import DuplicateLine from "./main";
import { getEditor, getContent } from "./utils";
import { Console } from "./Console";

export const handleSelectionChange = (plugin: DuplicateLine) => {
    reset(plugin)
    const debounced = debounce(async () => {
        plugin.nb = getOccurrences(plugin);
        if (plugin.settings.showOccurences && plugin.nb > 1) {
            if (!plugin.statusBarItemEl) {
                await addStatusBarReps.bind(plugin)(plugin)
            }
        } else {
            reset(plugin)
        }
    }, 300, true);
    debounced()
}

export function reset(plugin: DuplicateLine) {
    plugin.selectionRegex = null
    plugin.nb = 0
    plugin.statusBarItemEl?.detach()
    plugin.statusBarItemEl = null
}

export async function addStatusBarReps(plugin: DuplicateLine) {
    plugin.statusBarItemEl = await this.addStatusBarItem() as HTMLElement
    const { statusBarItemEl } = plugin
    statusBarItemEl.setText(`${plugin.nb} Reps`);
    statusBarItemEl.style.color = plugin.settings.color;
    statusBarItemEl.style.fontSize = `${plugin.settings.fontSize}em`;
}


function getEditorContent(plugin: DuplicateLine) {
    const editor = getEditor(plugin);
    let text = "";
    if (editor) {
        text = getContent(editor);
    }
    return {
        editor,
        text
    }
}

export function getOccurrences(plugin: DuplicateLine): number {
    const { editor, text } = getEditorContent(plugin);
    if (!editor) return 0
    const selection = editor.getSelection().trim();
    if (!selection) return 0;

    if (!plugin.selectionRegex) {
        Console.log("compile regex 1", selection)
        compileRegex(plugin, selection);
    }
    if (!plugin.selectionRegex) {
        Console.log("selection regex is null");
    } else if (plugin.selectionRegex.source !== selection) {
        Console.log("compile regex 2", selection);
        compileRegex(plugin, selection);
    }

    const matches = [...text.matchAll(plugin.selectionRegex!)];

    Console.log("matches length", matches.length)
    return matches.length;
}

function compileRegex(plugin: DuplicateLine, selection: string) {
    let modifiers = 'g';
    if (!plugin.settings.matchCase) {
        Console.log("yes")
        modifiers += 'i';
    }
    plugin.selectionRegex = new RegExp(selection, modifiers);
}
