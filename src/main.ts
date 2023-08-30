import {
	Editor,
	EditorChange,
	EditorRange,
	EditorSelection,
	EditorTransaction,
	Plugin,
} from "obsidian";
import { sortBy } from "lodash";
import { DuplicateLineSettings } from "./settings";
import { DEFAULT_SETTINGS, Direction, commandsToCreate, dupliSettings } from "./types";
import { areObjectsEqual, selectionToLine, selectionToRange } from "./utils";


export default class DuplicateLine extends Plugin {
	settings: dupliSettings
	newDirection: Direction | null

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new DuplicateLineSettings(this.app, this));
		this.createCommandsFromSettings()
	}

	createCommandsFromSettings() {
		commandsToCreate.forEach(commandConfig => {
			this.addCommand({
				id: commandConfig.id,
				name: commandConfig.name,
				editorCheckCallback: (checking: boolean, editor) => {
					if (this.settings[commandConfig.condition]) {
						if (!checking) {
							this.duplicateLine(editor, commandConfig.direction)
						}
						return true;
					}
					return false;
				}
			});
		});
	}


	async loadSettings() {
		this.settings = {
			...DEFAULT_SETTINGS, ...await this.loadData()
		}
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	duplicateLine = (editor: Editor, direction: Direction): void => {
		let selections = editor.listSelections();
		let addedLines = 0;
		const changes: EditorChange[] = [];
		const newSelectionRanges: EditorRange[] = [];

		for (let selection of selections) {
			const range = selectionToLine(
				editor,
				selection,
				direction
			);
			const numberOfLines = range.to.line - range.from.line + 1;
			let content = editor.getRange(range.from, range.to);
			if (!content.trim()) continue; // empty line

			let change: EditorChange;
			let newAnchor = {
				line: 0,
				ch: 0,
			};
			let newHead = {
				line: 0,
				ch: 0,
			};


			if (this.newDirection) {
				direction = this.newDirection
				this.newDirection = null
			}
			addedLines += numberOfLines;
			const { anchor, head } = selection
			const sameDirection = areObjectsEqual(head, range.to)
			const areEqual = areObjectsEqual(head, range.to)
			const toLength = editor.getLine(range.to.line).length

			switch (direction) {
				case Direction.Down:
					newAnchor = {
						line: anchor.line + addedLines,
						ch: anchor.ch,
					};

					newHead = {
						line: head.line + addedLines,
						ch: head.ch,
					};

					{
						change = {
							from: range.to,
							to: range.to,
							text: "\n" + content,
						};
					}
					break;

				case Direction.Up:
					newAnchor = {
						line: anchor.line + addedLines - numberOfLines,
						ch: anchor.ch,
					};

					newHead = {
						line: head.line + addedLines - numberOfLines,
						ch: head.ch,
					};

					{
						change = {
							from: range.from,
							to: range.from,
							text: content + "\n",
						};
					}
					break;

				case Direction.Left: {
					if (this.settings.addSpaceBetween) content = content + " "

					newAnchor = {
						line: anchor.line,
						ch: anchor.ch,
					};

					newHead = {
						line: head.line,
						ch: head.ch,
					};

					change = {
						from: range.from,
						to: range.from,
						text: content,
					};
					break;
				}

				case Direction.Right: {
					if (this.settings.addSpaceBetween) content = " " + content

					newAnchor = {
						line: anchor.line,
						ch: anchor.ch + content.length,
					};

					newHead = {
						line: head.line,
						ch: head.ch + content.length,
					};

					change = {
						from: range.to,
						to: range.to,
						text: content,
					};
					break;
				}
				case Direction.SelDown: {
					newAnchor = {
						line: anchor.line + addedLines,
						ch: areEqual ? toLength : sameDirection ?
							0 : Math.abs(anchor.ch - head.ch)
					};

					newHead = {
						line: head.line + addedLines,
						ch: areEqual ? toLength : sameDirection ?
							Math.abs(anchor.ch - head.ch) : 0,
					};

					const NewrangeLineTo = { line: range.to.line, ch: toLength }
					{
						change = {
							from: NewrangeLineTo,
							to: NewrangeLineTo,
							text: "\n" + content,
						};
					}

					break;
				}
				case Direction.SelUp: {
					newAnchor = {
						line: sameDirection ? anchor.line + addedLines - numberOfLines -1 : anchor.line + addedLines - numberOfLines,
						ch: areEqual ? toLength : sameDirection ? 0 :
							editor.getLine(range.from.line).length - range.from.ch,
					};
					newHead = {
						line: head.line + addedLines - numberOfLines,
						ch: areEqual ? toLength : sameDirection ?							
							editor.getLine(range.to.line).length - range.to.ch
							: 0,
					};

					const NewrangeLineFrom = { line: range.from.line, ch: 0 }
					{
						change = {
							from: NewrangeLineFrom,
							to: NewrangeLineFrom,
							text: content + "\n",
						};
					}
					break;
				}
				case Direction.RightDown: {
					const isEmptySelection = (anchor.ch === head.ch) && (anchor.line === head.line);
					if (this.settings.addSpaceBetween) content = isEmptySelection ? content : " " + content

					newAnchor = {
						line: anchor.line,
						ch: isEmptySelection ? toLength : anchor.ch + content.length,
					};

					newHead = {
						line: head.line,
						ch: isEmptySelection ? toLength : head.ch + content.length,
					};

					change = {
						from: range.to,
						to: range.to,
						text: isEmptySelection ? "\n" + content : content,
					};
					break
				}
			}

			newSelectionRanges.push(
				selectionToRange({
					anchor: newAnchor,
					head: newHead,
				})
			);

			changes.push(change);
		}

		if (changes.length > 0) {
			const transaction: EditorTransaction = {
				changes: changes,
				selections: newSelectionRanges,
			};

			const origin = "DirectionalCopy_" + String(direction);
			editor.transaction(transaction, origin);
		}
	};

}


