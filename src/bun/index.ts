import { BrowserView, BrowserWindow, Utils } from "electrobun/bun"
import type { MyRPC } from "../shared/rpc"
import type { UserSettings } from "../shared/userSettings"
import { loadAlbums } from "./metadata/albums"
import { loadLibrary } from "./metadata/library"
import { readOrCreateLibraryMetadata } from "./metadata/scanner"
import { readTrackFile } from "./readTrack"
import { loadUserSettings, updateUserSettings } from "./userSettings"

const rpc = BrowserView.defineRPC<MyRPC>({
	maxRequestTime: Infinity,
	handlers: {
		requests: {
			loadUserSettings: async () => {
				const loadedSettings = await loadUserSettings()
				return loadedSettings
			},
			updateUserSettings: async (userSettings: Partial<UserSettings>) => {
				return await updateUserSettings(userSettings)
			},
			pickFolder: async () => {
				const [folder] = await Utils.openFileDialog({
					canChooseDirectory: true,
					canChooseFiles: false,
				})
				// user cancelled selection
				if (!folder) return null
				const metadata = await readOrCreateLibraryMetadata(folder)
				return { folder, metadata }
			},
			loadAlbums: async (dirs: string[]) => {
				return await loadAlbums(dirs)
			},
			loadLibrary: async (dir: string) => {
				return await loadLibrary(dir)
			},
			readTrackFile: async ({ directory, filename }) => {
				return await readTrackFile(directory, filename)
			},
		},
	},
})

// Create the main application window
const window = new BrowserWindow({
	title: "S'il vous play",
	url: "views://mainview/index.html",
	rpc,
	frame: {
		width: 800,
		height: 600,
		x: 100,
		y: 60,
	},
})

// hack to make the view actually reload when the dom is ready to get the audio player
// to appear inside the browser frame
window.webview.on("dom-ready", () => {
	const { width, height } = window.getFrame()
	window.setSize(width + 1, height)
	window.setSize(width, height)
})
