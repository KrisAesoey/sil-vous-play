import type { RPCSchema } from "electrobun"
import type { AlbumEntry, LibraryMetadata, Metadata } from "./audio"
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
			loadAlbums: {
				params: string[]
				response: AlbumEntry[]
			}
			loadLibrary: {
				params: string
				response: LibraryMetadata | null
			}
			refreshLibrary: {
				params: string
				response: LibraryMetadata
			}
			selectLibrary: {
				params: undefined
				response: { dir: string; metadata: Metadata } | null
			}
			readTrackFile: {
				params: {
					directory: string
					filename: string
				}
				response: string | null
			}
			loadCovers: {
				params: string[]
				response: Record<string, string>
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
