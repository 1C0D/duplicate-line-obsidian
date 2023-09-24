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
	selectionRight: boolean;
	selectionLeft: boolean;
	selectionUp: boolean;
	selectionDown: boolean;
	mixRightDown: boolean;
}

export const DEFAULT_SETTINGS: dupliSettings = {
	addSpaceBetween: true,
	lineDown: true,
	lineUp: true,
	selectionRight: true,
	selectionLeft: true,
	selectionUp: true,
	selectionDown: true,
	mixRightDown: false,
};

export interface CommandConfig {
	id: string;
	name: string;
	direction: Direction;
	condition: string;
}

export const commandsToCreate: Array<CommandConfig> = [
	{
		id: "duplicate-line",
		name: "Line Down",
		direction: Direction.Down,
		condition: "lineDown",
	},
	{
		id: "duplicate-line-up",
		name: "Line Up",
		direction: Direction.Up,
		condition: "lineUp",
	},
	{
		id: "duplicate-selection-down",
		name: "Selection Down",
		direction: Direction.SelDown,
		condition: "selectionDown",
	},
	{
		id: "duplicate-selection-up",
		name: "Selection Up",
		direction: Direction.SelUp,
		condition: "selectionUp",
	},
	{
		id: "duplicate-line-right",
		name: "Selection Right",
		direction: Direction.Right,
		condition: "selectionRight",
	},
	{
		id: "duplicate-line-left",
		name: "Selection Left",
		direction: Direction.Left,
		condition: "selectionLeft",
	},
	{
		id: "duplicate-line-right-down",
		name: "Selection Right Line Down",
		direction: Direction.RightDown,
		condition: "mixRightDown",
	},
];

declare module "obsidian" {
	interface Editor {
		addHighlights(ranges: EditorRange[], cls: string): void;
		removeHighlights(cls: string): void;
	}
}
