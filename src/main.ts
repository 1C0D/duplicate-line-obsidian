// todo improve add remove commands (hotkey are still visibles)
// add recommanded hotkeys in settings desc
import {
	Editor,
	EditorChange,
	EditorRange,
	EditorTransaction,
	Plugin,
} from "obsidian";
import { DuplicateLineSettings } from "./settings";
import {
	DEFAULT_SETTINGS,
	Direction,
	commandsToCreate,
	dupliSettings,
} from "./types";
import {
	areObjectsEqual,
	isNoSelection,
	selectionToLine,
	selectionToRange,
} from "./utils";
import { addNextOccurrence } from "./AddNextOccurrence";
import { addAllOccurrences } from "./AddAllOccurrences";

export default class DuplicateLine extends Plugin {
	settings: dupliSettings;
	newDirection: Direction | null;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new DuplicateLineSettings(this.app, this));
		this.createCommandsFromSettings();
	}

	createCommandsFromSettings() {
		commandsToCreate.forEach((commandConfig) => {
			this.addCommand({
				id: commandConfig.id,
				name: commandConfig.name,
				icon: commandConfig.icon,
				editorCheckCallback: (checking: boolean, editor) => {
					const condition = commandConfig.condition;
					const conditionValue =
						this.settings[condition as keyof dupliSettings];
					if (conditionValue) {
						if (!checking) {
							if (commandConfig.direction != null) {
								if (condition === "moveRight" || condition === "moveLeft") this.directionalMove(
									editor,
									commandConfig.direction
								)
								else
									this.duplicateLine(
										editor,
										commandConfig.direction
									);
							}
							else if (condition === "addNextOcc")
								addNextOccurrence(editor);
							else if (condition === "selAllOcc")
								addAllOccurrences(editor);
						}
						return true;
					}
					return false;
				},
			});
		});
	}

	async loadSettings() {
		this.settings = {
			...DEFAULT_SETTINGS,
			...(await this.loadData()),
		};
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
			const range = selectionToLine(editor, selection, direction);
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
				direction = this.newDirection;
				this.newDirection = null;
			}
			addedLines += numberOfLines;
			const { anchor, head } = selection;
			const { from, to } = range;
			const sameDirection = areObjectsEqual(head, range.to);
			const isEmptySelection = isNoSelection(selection);
			const toLength = editor.getLine(to.line).length;
			const headLength = editor.getLine(head.line).length;
			const anchorLength = editor.getLine(anchor.line).length;

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
							from: to,
							to: to,
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
							from: from,
							to: from,
							text: content + "\n",
						};
					}
					break;

				case Direction.Left: {
					if (this.settings.addSpaceBetween) content = content + " ";

					newAnchor = {
						line: anchor.line,
						ch: anchor.ch,
					};

					newHead = {
						line: head.line,
						ch: head.ch,
					};

					change = {
						from: from,
						to: from,
						text: content,
					};
					break;
				}

				case Direction.Right: {
					if (this.settings.addSpaceBetween) content = " " + content;

					newAnchor = {
						line: anchor.line,
						ch: anchor.ch + content.length,
					};

					newHead = {
						line: head.line,
						ch: head.ch + content.length,
					};

					change = {
						from: to,
						to: to,
						text: content,
					};
					break;
				}
				case Direction.SelDown: {
					newAnchor = {
						line: anchor.line + addedLines,
						ch: isEmptySelection
							? 0
							: sameDirection
								? 0
								: numberOfLines === 1
									? content.length
									: anchorLength,
					};

					newHead = {
						line: head.line + addedLines,
						ch: isEmptySelection
							? headLength
							: sameDirection
								? numberOfLines === 1
									? content.length
									: headLength
								: 0,
					};

					const NewrangeLineTo = { line: to.line, ch: toLength };
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
						line: anchor.line + addedLines - numberOfLines,
						ch: isEmptySelection
							? 0
							: sameDirection
								? 0
								: numberOfLines === 1
									? content.length
									: anchorLength,
					};
					newHead = {
						line: sameDirection
							? anchor.line + addedLines - 1
							: head.line + addedLines - numberOfLines,
						ch: isEmptySelection
							? toLength
							: sameDirection
								? headLength
								: 0,
					};

					const NewrangeLineFrom = { line: from.line, ch: 0 };
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
					if (this.settings.addSpaceBetween)
						content = isEmptySelection ? content : " " + content;

					newAnchor = {
						line: anchor.line,
						ch: isEmptySelection
							? toLength
							: anchor.ch + content.length,
					};

					newHead = {
						line: head.line,
						ch: isEmptySelection
							? toLength
							: head.ch + content.length,
					};

					change = {
						from: to,
						to: to,
						text: isEmptySelection ? "\n" + content : content,
					};
					break;
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

	directionalMove = (
		editor: Editor,
		direction: Direction,
	): void => {
		const selections = editor.listSelections()
		const changes: Array<EditorChange> = []
		for (const selection of selections) {
			if (isNoSelection(selection)) continue
			const range = selectionToRange(selection, true)
			let additionChange: EditorChange
			let deletionChange: EditorChange
			switch (direction) {
				case Direction.Left: {
					const isStart = (range.from.line === 0 && range.from.ch === 0)
					const isLineStart = range.from.ch === 0
					// if ()
					deletionChange = {
						from: isStart ? {
							line: range.from.line,
							ch: range.from.ch,
						} : isLineStart ? {
							line: range.from.line - 1,
							ch: editor.getLine(range.from.line - 1).length - 1,
						} : {
							line: range.from.line,
							ch: range.from.ch - 1,
						},
						to: range.from,
						text: '',
					}

					additionChange = {
						from: range.to,
						to: range.to,
						text: editor.getRange(deletionChange.from, deletionChange.to!),
					}
					break
				}
				case Direction.Right: {
					const isExtrem = (range.to.line === editor.lastLine() && range.to.ch === editor.getLine(range.to.line).length)

					deletionChange = {
						from: range.to,
						to: isExtrem ? {
							line: range.to.line,
							ch: range.to.ch,
						} : {
							line: range.to.line,
							ch: range.to.ch + 1,
						},
						text: '',
					}

					additionChange = {
						from: range.from,
						to: range.from,
						text: editor.getRange(deletionChange.from, deletionChange.to!),
					}
					break
				}
			}
			//@ts-ignore
			changes.push(deletionChange, additionChange)
		}

		if (changes.length > 0) {
			const transaction: EditorTransaction = {
				changes: changes,
			}

			const origin = 'DirectionalMove_' + String(direction)
			editor.transaction(transaction, origin)
		}
	}
}
