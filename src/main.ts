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
					console.log("this.settings[commandConfig.condition]", this.settings[commandConfig.condition])
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

		// if (direction === Direction.RightDown) {
		// 	selections = [{ anchor: editor.getCursor(), head: editor.getCursor() },]
		// }

		// bug outside of doc 

		for (let selection of selections) {
			const newSelection = this.selectionToLine(
				editor,
				selection,
				direction
			);
console.log("selection", selection)
			const rangeLine = this.selectionToRange(newSelection, true); //already sorted
			const numberOfLines = rangeLine.to.line - rangeLine.from.line + 1;
			let content = editor.getRange(rangeLine.from, rangeLine.to);
			if (!content.trim()) continue;

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
			switch (direction) {
				case Direction.Down:
					addedLines += numberOfLines;
					newAnchor = {
						line: selection.anchor.line + addedLines,
						ch: selection.anchor.ch,
					};
					newHead = {
						line: selection.head.line + addedLines,
						ch: selection.head.ch,
					};

					{
						change = {
							from: rangeLine.to,
							to: rangeLine.to,
							text: "\n" + content,
						};
					}
					break;

				case Direction.Up:
					console.log("Up")
					newAnchor = {
						line: selection.anchor.line + addedLines,
						ch: selection.anchor.ch,
					};
					newHead = {
						line: selection.head.line + addedLines,
						ch: selection.head.ch,
					};

					addedLines += numberOfLines;
					{
						change = {
							from: rangeLine.from,
							to: rangeLine.from,
							text: content + "\n",
						};
					}
					break;

				case Direction.Left: {
					if (this.settings.addSpaceBetween) content = content + " "
					newAnchor = {
						line: selection.anchor.line,
						ch: selection.anchor.ch,
					};
					newHead = {
						line: selection.head.line,
						ch: selection.head.ch,
					};
					change = {
						from: rangeLine.from,
						to: rangeLine.from,
						text: content,
					};
					break;
				}

				case Direction.Right: {
					if (this.settings.addSpaceBetween) content = " " + content
					newAnchor = {
						line: selection.anchor.line,
						ch: selection.anchor.ch + content.length,
					};
					newHead = {
						line: selection.head.line,
						ch: selection.head.ch + content.length,
					};
					change = {
						from: rangeLine.to,
						to: rangeLine.to,
						text: content,
					};
					break;
				}
				case Direction.SelDown: {
					addedLines += numberOfLines;
					const toLength = editor.getLine(rangeLine.to.line).length
					const NewrangeLineTo = { line: rangeLine.to.line, ch: toLength }
					const condition = this.areObjectsEqual(selection.head, rangeLine.to)

					newAnchor = {
						line: selection.anchor.line + addedLines,
						ch: condition ?
							0 : Math.abs(selection.anchor.ch - selection.head.ch)
					};

					newHead = {
						line: selection.head.line + addedLines,
						ch: condition ?
							Math.abs(selection.anchor.ch - selection.head.ch) : 0,
					};

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
					addedLines += numberOfLines;
					const condition = this.areObjectsEqual(selection.head, rangeLine.to)
					const NewrangeLineFrom = { line: rangeLine.from.line, ch: 0 }
					newAnchor = {
						line: selection.anchor.line + addedLines,
						ch: condition ? 0 : Math.abs(selection.anchor.ch - selection.head.ch),
					};
					newHead = {
						line: selection.head.line + addedLines,
						ch: condition ? Math.abs(selection.anchor.ch - selection.head.ch) : 0,
					};
					newAnchor = {
						line: selection.anchor.line + addedLines,
						ch: selection.anchor.ch,
					};
					newHead = {
						line: selection.head.line + addedLines,
						ch: selection.head.ch,
					};

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
					addedLines += numberOfLines;
					const condition = this.areObjectsEqual(selection.head, rangeLine.to)
					const NewrangeLineFrom = { line: rangeLine.from.line, ch: 0 }
					newAnchor = {
						line: selection.anchor.line + addedLines,
						ch: condition ? 0 : Math.abs(selection.anchor.ch - selection.head.ch),
					};
					newHead = {
						line: selection.head.line + addedLines,
						ch: condition ? Math.abs(selection.anchor.ch - selection.head.ch) : 0,
					};
					newAnchor = {
						line: selection.anchor.line + addedLines,
						ch: selection.anchor.ch,
					};
					newHead = {
						line: selection.head.line + addedLines,
						ch: selection.head.ch,
					};

					{
						change = {
							from: NewrangeLineFrom,
							to: NewrangeLineFrom,
							text: content + "\n",
						};
					}
					break;
				}
			}

			newSelectionRanges.push(
				this.selectionToRange({
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

	areObjectsEqual(obj1: any, obj2: any) {
		return obj1.line === obj2.line && obj1.ch === obj2.ch;
	}

	selectionToRange(selection: EditorSelection, sort?: boolean): EditorRange {
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

	selectionToLine(
		editor: Editor,
		selection: EditorSelection,
		direction: Direction
	): EditorSelection {
		const range = this.selectionToRange(selection, true); // {from:{line: 11, ch: 0} to:{line: 12...
		const vertical: boolean = direction === Direction.Up || direction === Direction.Down;
		const isEmptySelection = (selection.anchor.ch === selection.head.ch) && (selection.anchor.line === selection.head.line);
		const toLength = editor.getLine(range.to.line).length

		if (vertical) {
			const newSelection: EditorSelection = {
				anchor: { line: range.from.line, ch: 0 },
				head: { line: range.to.line, ch: toLength },
			};
			return newSelection;

		} else if (direction === Direction.SelDown) {
			return selection;
		}
		else if (direction === Direction.RightDown) {
			if (isEmptySelection) {
				const newSelection: EditorSelection = {
					anchor: { line: range.to.line, ch: 0 },
					head: { line: range.to.line, ch: toLength },
				};
				this.newDirection = Direction.Down
				return newSelection
			} else {
				this.newDirection = Direction.Right
				return {
					anchor: range.from,
					head: range.to,
				};
			}
		}
		else {
			// no selection (testing word before cursor)
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
					const newSelection: EditorSelection = {
						anchor: { line: line, ch: (ch - contentLength) },
						head: { line: line, ch: (ch) },
					};
					return newSelection
				}

			}
			return {
				anchor: editor.getCursor("from"),
				head: editor.getCursor("to"),
			};
		}
	}
}


