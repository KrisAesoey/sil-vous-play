import { Electroview } from "electrobun/view"
import { createRoot } from "react-dom/client"
import type { MyRPC } from "../shared/rpc"
import { App } from "./App"
import { PlaybackProvider } from "./playback/playbackContext"
import { UserSettingsProvider } from "./userSettings/userSettingsContext"

console.log("Hello Electrobun view loaded!")

const rpc = Electroview.defineRPC<MyRPC>({
	maxRequestTime: Infinity,
	handlers: {},
})
new Electroview({ rpc })

const rootElement = document.getElementById("root")

if (!rootElement) throw new Error("Missing root element")

createRoot(rootElement).render(
	<UserSettingsProvider rpc={rpc}>
		<PlaybackProvider>
			<App rpc={rpc} />
		</PlaybackProvider>
	</UserSettingsProvider>,
)
