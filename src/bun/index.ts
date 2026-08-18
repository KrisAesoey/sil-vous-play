import { BrowserView, BrowserWindow, Utils } from "electrobun/bun"
import type { MyRPC } from "../shared/rpc"
import { readOrCreateMetadataFile } from "./metadata"
import { readTrackFile } from "./readTrack"

let currentFolder: string | null = null

const rpc = BrowserView.defineRPC<MyRPC>({
	maxRequestTime: Infinity,
	handlers: {
		requests: {
			pickFolder: async () => {
				const [folder] = await Utils.openFileDialog({
					canChooseDirectory: true,
					canChooseFiles: false,
				})
				// user cancelled selection
				if (!folder) return null
				currentFolder = folder
				return await readOrCreateMetadataFile(folder)
			},
			readTrackFile: async (filename: string) => {
				if (!currentFolder) return null
				return await readTrackFile(currentFolder, filename)
			},
		},
	},
})

// Create the main application window
const mainWindow = new BrowserWindow({
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

mainWindow.webview.openDevTools()

console.log("Hello Electrobun app started!")
