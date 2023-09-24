import {
	Editor,
	EditorPosition,
	EditorRange,
	EditorSelection,
	EditorSelectionOrCaret,
} from "obsidian";
import { selectionToRange } from "./utils";

export const selectNextOccurence = (editor: Editor) => {
	let selections = editor.listSelections();
	const { word, wordRange, isWordSelected } = getSelectionContent(
		editor,
		selections
	);
	if (wordRange !== null) {
		const doc = getContent(editor);
		const [startPos, endPos] = rangeToPositions(wordRange);
		const pos = editor.posToOffset(endPos);
		let nextOccurenceIndex = doc.indexOf(word, pos);
		if (nextOccurenceIndex !== -1) {
			const nextOccurenceStart = editor.offsetToPos(nextOccurenceIndex);
			const nextOccurenceEnd = editor.offsetToPos(
				nextOccurenceIndex + word.length
			);

			editor.removeHighlights("is-flashing");

			if (!isWordSelected)
				selections[selections.length - 1] = {
					anchor: wordRange.from,
					head: wordRange.to,
				};

			if (isWordSelected)
				selections.push({
					anchor: nextOccurenceStart,
					head: nextOccurenceEnd,
				});

			editor.setSelections(selections);
			for (const sel of selections) {
				const range = selectionToRange(sel);
				editor.addHighlights([range], "is-flashing");
			}

			const newWordRange = {
				from: nextOccurenceStart,
				to: nextOccurenceEnd,
			};
			nextOccurenceIndex = doc.indexOf(
				word,
				nextOccurenceIndex + word.length
			);

			app.workspace.iterateCodeMirrors((cm) =>
				cm.setOption("mode", cm.getOption("mode"))
			);
		}
	}
};

export const getSelectionContent = (
	ed: Editor,
	selections: EditorSelection[]
) => {
	const lastSelection = selections[selections.length - 1];
	const wordRange = ed.wordAt(lastSelection.head);
	if (wordRange != null) {
		const { from, to } = wordRange;
		const word = ed.getRange(from, to);
		const isWordSelected =
			from.line === lastSelection.anchor.line &&
			from.ch === lastSelection.anchor.ch &&
			to.line === lastSelection.head.line &&
			to.ch === lastSelection.head.ch;
		return { wordRange, word, isWordSelected };
	}
	return { wordRange: null, word: "", isWordSelected: false };
};

function rangeToPositions(
	range: EditorRange
): [EditorPosition, EditorPosition] {
	const startPos: EditorPosition = range.from;
	const endPos: EditorPosition = range.to;
	return [startPos, endPos];
}

export const getContent = (ed: Editor) => {
	return ed.getValue();
};
