import path from "node:path"
import { Utils } from "electrobun"

import {
	DEFAULT_USER_SETTINGS,
	type UserSettings,
	UserSettingsSchema,
} from "../shared/userSettings"

const USER_SETTINGS_FILENAME = "userSettings.json"

export async function loadUserSettings(): Promise<UserSettings> {
	const userSettingsPath = path.join(
		Utils.paths.userData,
		USER_SETTINGS_FILENAME,
	)
	const userSettingsFile = Bun.file(userSettingsPath)

	if (!(await userSettingsFile.exists())) {
		console.log("Not user data file found")
		console.log("Creating user data file...")
		await saveUserSettings(DEFAULT_USER_SETTINGS)
		return DEFAULT_USER_SETTINGS
	}

	const parsedUserSettings = UserSettingsSchema.safeParse(
		await userSettingsFile.json(),
	)
	if (!parsedUserSettings.success) {
		console.error("Invalid user data file:", parsedUserSettings.error)
		return DEFAULT_USER_SETTINGS
	}

	return parsedUserSettings.data
}

export async function updateUserSettings(
	patch: Partial<UserSettings>,
): Promise<UserSettings> {
	const current = await loadUserSettings()
	const parsedUpdated = UserSettingsSchema.safeParse({ ...current, ...patch })
	if (!parsedUpdated.success) {
		console.error("Invalid update to user settings:", parsedUpdated.error)
		return current
	}
	await saveUserSettings(parsedUpdated.data)
	return parsedUpdated.data
}

async function saveUserSettings(userSettings: UserSettings) {
	const userSettingsPath = path.join(
		Utils.paths.userData,
		USER_SETTINGS_FILENAME,
	)
	await Bun.write(userSettingsPath, JSON.stringify(userSettings, null, 2))
}
