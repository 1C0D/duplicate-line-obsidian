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
			setting.setDesc(commandConfig.desc as keyof dupliSettings)
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

						if (this.plugin.settings[
							commandConfig.condition as keyof dupliSettings
						]) {
							const condition = commandConfig.condition;
							this.plugin.addCommandToEditor(commandConfig, condition)
						}
						else {
							await (this.app as any).commands.removeCommand(`duplicate-line:${commandConfig.id}`)//command id found in app.commands.commands...
						}
						await this.plugin.saveSettings();
					});
			});
		});
	}
}
