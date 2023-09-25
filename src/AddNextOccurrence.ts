import {
	Editor,
} from "obsidian";
import { getContent, getSelectionContent, rangeToPositions, selectionToRange } from "./utils";

export const addNextOccurrence = (editor: Editor) => {
	let selections = editor.listSelections();
	const { word, wordRange, isWordSelected } = getSelectionContent(
		editor,
		selections
	);
	if (wordRange !== null) {
		const doc = getContent(editor);
		const [_,endPos] = rangeToPositions(wordRange);
		const pos = editor.posToOffset(endPos);
		let nextOccurrenceIndex = doc.indexOf(word, pos);
		if (nextOccurrenceIndex !== -1) {
			const nextOccurrenceStart = editor.offsetToPos(nextOccurrenceIndex);
			const nextOccurrenceEnd = editor.offsetToPos(
				nextOccurrenceIndex + word.length
			);

			editor.removeHighlights("is-flashing"); 

			if (!isWordSelected)
				selections[selections.length - 1] = {
					anchor: wordRange.from,
					head: wordRange.to,
				};


			if (isWordSelected)
				selections.push({
					anchor: nextOccurrenceStart,
					head: nextOccurrenceEnd,
				});

			editor.setSelections(selections);

			for (const sel of selections){
				const range = selectionToRange(sel);
				editor.addHighlights([range], "is-flashing");
			}

			const nextOccurrenceIndex2 = doc.indexOf(
				word,
				nextOccurrenceIndex + word.length
			);
			nextOccurrenceIndex = nextOccurrenceIndex2 !== -1 ? nextOccurrenceIndex2 : nextOccurrenceIndex;
		}
	}
};




