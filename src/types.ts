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
}

export const commandsToCreate: Array<CommandConfig> = [
	{
		id: "duplicate-line",
		name: "Duplicate Line Down",
		icon: "arrow-down-from-line",
		direction: Direction.Down,
		condition: "lineDown",
	},
	{
		id: "duplicate-line-up",
		name: "Duplicate Line Up",
		icon: "arrow-up-from-line",
		direction: Direction.Up,
		condition: "lineUp",
	},
	{
		id: "duplicate-selection-down",
		name: "Duplicate Selection Down",
		icon: "arrow-down",
		direction: Direction.SelDown,
		condition: "selectionDown",
	},
	{
		id: "duplicate-selection-up",
		name: "Duplicate Selection Up",
		icon: "arrow-up",
		direction: Direction.SelUp,
		condition: "selectionUp",
	},
	{
		id: "duplicate-line-right",
		name: "Duplicate Selection Right",
		icon: "arrow-right-from-line",
		direction: Direction.Right,
		condition: "selectionRight",
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
	},
	{
		id: "directional-move-right",
		name: "Move Right",
		icon: "arrow-right",
		direction: Direction.Right,
		condition: "moveRight",
	},
	{
		id: "directional-move-left",
		name: "Move Left",
		icon: "arrow-left",
		direction: Direction.Left,
		condition: "moveLeft",
	},
	{
		id: "select-next-occurence",
		name: "Add next occurence",
		icon: "arrow-down-narrow-wide",
		direction: null,
		condition: "addNextOcc",
	},
	{
		id: "select-all-occurence",
		name: "Select all occurences",
		icon: "bar-chart-horizontal",
		direction: null,
		condition: "selAllOcc",
	},
];

declare module "obsidian" {
	interface Editor {
		addHighlights(ranges: EditorRange[], cls: string): void;
		removeHighlights(cls: string): void;
	}
}
