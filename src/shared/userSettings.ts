import { z } from "zod"

export const UserSettingsSchema = z.object({
	libraryRoot: z.string().optional(),
	volume: z.number().min(0.0).max(1.0),
})

export type UserSettings = z.infer<typeof UserSettingsSchema>

export const DEFAULT_USER_SETTINGS: UserSettings = {
	volume: 1.0,
}
