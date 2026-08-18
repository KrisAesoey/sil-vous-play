import type { RPCSchema } from "electrobun"
import type { Metadata } from "./audio"

export type MyRPC = {
	bun: RPCSchema<{
		// requests the view sends to bun
		requests: {
			pickFolder: {
				params: undefined
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
