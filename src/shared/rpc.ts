import type { RPCSchema } from "electrobun"
import type { Metadata } from "./audio"
import type { UserSettings } from "./userSettings"

export type MyRPC = {
	bun: RPCSchema<{
		// requests the view sends to bun
		requests: {
			loadUserSettings: {
				params: undefined
				response: UserSettings
			}
			updateUserSettings: {
				params: Partial<UserSettings>
				response: UserSettings
			}
			pickFolder: {
				params: undefined
				response: { folder: string; metadata: Metadata } | null
			}
			readFolder: {
				params: string
				response: Metadata | null
			}
			readTrackFile: {
				params: string
				response: string | null
			}
		}
		messages: Record<string, never>
	}>
	webview: RPCSchema<{
		// requests bun sends to the view
		requests: Record<string, never>
		messages: Record<string, never>
	}>
}
