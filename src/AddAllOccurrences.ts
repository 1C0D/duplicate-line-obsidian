import { Editor } from "obsidian";
import { getContent, getSelectionContent, selectionToRange } from "./utils";

export const addAllOccurrences = (editor: Editor) => {
	let selections = editor.listSelections();
	const { word, wordRange } = getSelectionContent(editor, selections);
	selections = [];
	if (wordRange !== null) {
		const doc = getContent(editor);
		let nextOccurrenceIndex = doc.indexOf(word);

		while (nextOccurrenceIndex !== -1) {
			const nextOccurrenceStart = editor.offsetToPos(nextOccurrenceIndex);
			const nextOccurrenceEnd = editor.offsetToPos(
				nextOccurrenceIndex + word.length
			);

			selections.push({
				anchor: nextOccurrenceStart,
				head: nextOccurrenceEnd,
			});

			nextOccurrenceIndex = doc.indexOf(
				word,
				nextOccurrenceIndex + word.length
			);
		}

		if (selections.length > 0) {
			const lastSelection = selections[selections.length - 1];
			const range = selectionToRange(lastSelection);
			editor.addHighlights([range], "is-flashing");
		}

		editor.removeHighlights("is-flashing");
		editor.setSelections(selections);
		for (const sel of selections) {
			const range = selectionToRange(sel);
			editor.addHighlights([range], "is-flashing");
		}
	}
};
