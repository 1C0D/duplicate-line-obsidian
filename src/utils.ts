import { Editor, EditorRange, EditorSelection } from "obsidian";
import { Direction } from "./types";
import { sortBy } from "lodash";

export function selectionToLine(
    editor: Editor,
    selection: EditorSelection,
    direction: Direction
): EditorRange {
    let range = selectionToRange(selection, true);
    const { from, to } = range
    const isEmptySelection = (from.ch === to.ch) && (from.line === to.line);
    const toLength = editor.getLine(range.to.line).length

    if (direction === Direction.Up || direction === Direction.Down) {
        return {
            from: { line: range.from.line, ch: 0 },
            to: { line: range.to.line, ch: toLength },
        };

    } else if (
        direction === Direction.SelDown ||
        direction === Direction.SelUp ||
        direction === Direction.RightDown
    ) {
        return isEmptySelection ?
            {
                from: { line: range.to.line, ch: 0 },
                to: { line: range.to.line, ch: toLength },
            }
            : range;
    }
    else { // selection right/left
        // if no selection word before cursor
        if (isEmptySelection) {
            const line = range.from.line
            const ch = range.from.ch
            if (ch > 0) {
                const currentLine = editor.getLine(line)
                // find previous word (thks GPT)
                let startOfWord = ch - 1;
                while (startOfWord >= 0 && /\S/.test(currentLine[startOfWord])) {
                    startOfWord--;
                }
                startOfWord++;
                // extract previous word
                const contentLength = currentLine.slice(startOfWord, ch).length;
                range = {
                    from: { line: line, ch: (ch - contentLength) },
                    to: { line: line, ch: (ch) },
                };
                return range
            }

        }
        return {
            from: range.from,
            to: range.to
        }
    }
}

export function areObjectsEqual(obj1: any, obj2: any) {
    return obj1.line === obj2.line && obj1.ch === obj2.ch;
}

export function selectionToRange(selection: EditorSelection, sort?: boolean): EditorRange {
    const positions = [selection.anchor, selection.head];
    let sorted = positions;
    if (sort) {
        sorted = sortBy(positions, ["line", "ch"]);
    }
    return {
        from: sorted[0],
        to: sorted[1],
    };
}