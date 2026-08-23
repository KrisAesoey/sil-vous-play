import { BrowserView, BrowserWindow, Utils } from "electrobun/bun"
import type { MyRPC } from "../shared/rpc"
import type { UserSettings } from "../shared/userSettings"
import { readMetadataFile, readOrCreateMetadataFile } from "./metadata"
import { readTrackFile } from "./readTrack"
import { loadUserSettings, updateUserSettings } from "./userSettings"

let currentFolder: string | null = null

const rpc = BrowserView.defineRPC<MyRPC>({
	maxRequestTime: Infinity,
	handlers: {
		requests: {
			loadUserSettings: async () => {
				const loadedSettings = await loadUserSettings()
				if (loadedSettings.libraryRoot) {
					currentFolder = loadedSettings.libraryRoot
				}
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
				currentFolder = folder
				const metadata = await readOrCreateMetadataFile(folder)
				return { folder, metadata }
			},
			readFolder: async (folder: string) => {
				return await readMetadataFile(folder)
			},
			readTrackFile: async (filename: string) => {
				if (!currentFolder) return null
				return await readTrackFile(currentFolder, filename)
			},
		},
	},
})

// Create the main application window
const _mainWindow = new BrowserWindow({
	title: "Hello Electrobun!",
	url: "views://mainview/index.html",
	rpc,
	frame: {
		width: 800,
		height: 800,
		x: 200,
		y: 200,
	},
})

console.log("Hello Electrobun app started!")
