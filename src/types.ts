import { arrow_down_from_line, arrow_down_narrow_wide, arrow_right_from_line, arrow_up_from_line } from "icons";
import { addIcon } from "obsidian";

export * from "obsidian";

export enum Direction {
	Up,
	Down,
	SelDown,
	SelUp,
	Left,
	Right,
	RightDown,
}

export interface dupliSettings {
	addSpaceBetween: boolean;
	lineDown: boolean;
	lineUp: boolean;
	moveRight: boolean;
	moveLeft: boolean;
	selectionRight: boolean;
	selectionLeft: boolean;
	selectionUp: boolean;
	selectionDown: boolean;
	mixRightDown: boolean;
	addNextOcc: boolean;
	selAllOcc: boolean;
}

export const DEFAULT_SETTINGS: dupliSettings = {
	addSpaceBetween: true,
	lineDown: true,
	lineUp: true,
	moveRight: true,
	moveLeft: true,
	selectionRight: true,
	selectionLeft: true,
	selectionUp: true,
	selectionDown: true,
	mixRightDown: false,
	addNextOcc: true,
	selAllOcc: true,
};

export interface CommandConfig {
	id: string;
	name: string;
	icon: string;
	direction: Direction | null;
	condition: string;
	desc: string
}

addIcon('arrow-down-narrow-wide', arrow_down_narrow_wide)
addIcon('arrow-down-from-line', arrow_down_from_line)
addIcon('arrow-up-from-line', arrow_up_from_line)
addIcon('arrow-right-from-line', arrow_right_from_line)

export const commandsToCreate: Array<CommandConfig> = [
	{
		id: "duplicate-line",
		name: "Duplicate Line Down",
		icon: "arrow-down-from-line",
		direction: Direction.Down,
		condition: "lineDown",
		desc: "recommanded shortcut shift alt ↓"

	},
	{
		id: "duplicate-line-up",
		name: "Duplicate Line Up",
		icon: "arrow-up-from-line",
		direction: Direction.Up,
		condition: "lineUp",
		desc: "recommanded shortcut shift alt ↑"
	},
	{
		id: "duplicate-selection-down",
		name: "Duplicate Selection Down",
		icon: "arrow-down",
		direction: Direction.SelDown,
		condition: "selectionDown",
		desc: "recommanded shortcut ctrl shift ↓"
	},
	{
		id: "duplicate-selection-up",
		name: "Duplicate Selection Up",
		icon: "arrow-up",
		direction: Direction.SelUp,
		condition: "selectionUp",
		desc: "recommanded shortcut ctrl shift ↑"
	},
	{
		id: "duplicate-line-right",
		name: "Duplicate Selection Right",
		icon: "arrow-right-from-line",
		direction: Direction.Right,
		condition: "selectionRight",
		desc: "recommanded shortcut ctrl shift →"
	},
	// {
	// 	id: "duplicate-line-left",
	// 	name: "Selection Left",
	// 	icon: "any icon name here",
	// 	direction: Direction.Left,
	// 	condition: "selectionLeft",
	// },
	{
		id: "duplicate-line-right-down",
		name: "Duplicate Selection Right/Line Down",
		icon: "arrow-down-right",
		direction: Direction.RightDown,
		condition: "mixRightDown",
		desc: "if no selection: duplicate line down, else duplicate selection right "
	},
	{
		id: "directional-move-right",
		name: "Move Right",
		icon: "arrow-right",
		direction: Direction.Right,
		condition: "moveRight",
		desc: "recommanded shortcut alt →"
	},
	{
		id: "directional-move-left",
		name: "Move Left",
		icon: "arrow-left",
		direction: Direction.Left,
		condition: "moveLeft",
		desc: "recommanded shortcut alt ←"
	},
	{
		id: "select-next-occurence",
		name: "Add next occurence",
		icon: "arrow-down-narrow-wide",
		direction: null,
		condition: "addNextOcc",
		desc: "recommanded shortcut ctrl D"
	},
	{
		id: "select-all-occurence",
		name: "Select all occurences",
		icon: "bar-chart-horizontal",
		direction: null,
		condition: "selAllOcc",
		desc: "recommanded shortcut ctrl shift L"
	},
];

declare module "obsidian" {
	interface Editor {
		addHighlights(ranges: EditorRange[], cls: string): void;
		removeHighlights(cls: string): void;
	}
}


