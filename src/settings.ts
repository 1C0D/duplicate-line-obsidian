import { App, PluginSettingTab, Setting } from "obsidian";
import DuplicateLine from "./main";
import { commandsToCreate, dupliSettings } from "./types";

export class DuplicateLineSettings extends PluginSettingTab {
	constructor(app: App, public plugin: DuplicateLine) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl("h2", { text: "Duplicate Line" });

		new Setting(containerEl)
			.setName("Add a space before right duplication")
			.setDesc("eg: 'xyz xyz, to avoid to have to insert a space")
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.addSpaceBetween)
					.onChange(async (value) => {
						this.plugin.settings.addSpaceBetween = value;
						await this.plugin.saveSettings();
					});
			});

		commandsToCreate.forEach((commandConfig) => {
			const setting = new Setting(containerEl).setName(
				commandConfig.name
			);
			if (commandConfig.condition === "mixRightDown")
				setting.setDesc(
					"if no selection: duplicate line down, else duplicate selection right "
				);
			setting.addToggle((toggle) => {
				toggle
					.setValue(
						this.plugin.settings[
							commandConfig.condition as keyof dupliSettings
						]
					)
					.onChange(async (value) => {
						this.plugin.settings[
							commandConfig.condition as keyof dupliSettings
						] = value;
						await this.plugin.saveSettings();
					});
			});
		});
	}
}
