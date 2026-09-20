import { BrowserView, BrowserWindow, Utils } from "electrobun/bun"
import type { MyRPC } from "../shared/rpc"
import type { UserSettings } from "../shared/userSettings"
import { loadCovers } from "./loadCovers"
import { loadAlbums } from "./metadata/albums"
import { loadLibrary, refreshLibrary } from "./metadata/library"
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
			loadAlbums: async (dirs: string[]) => {
				return await loadAlbums(dirs)
			},
			loadLibrary: async (dir: string) => {
				return await loadLibrary(dir)
			},
			refreshLibrary: async (dir: string) => {
				return await refreshLibrary(dir)
			},
			selectLibrary: async () => {
				const [dir] = await Utils.openFileDialog({
					canChooseDirectory: true,
					canChooseFiles: false,
				})
				// user cancelled selection
				if (!dir) return null
				const metadata = await readOrCreateLibraryMetadata(dir)
				return { dir, metadata }
			},
			readTrackFile: async ({ directory, filename }) => {
				return await readTrackFile(directory, filename)
			},
			loadCovers: async (albumPaths: string[]) => {
				return await loadCovers(albumPaths)
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
		width: 1200,
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
