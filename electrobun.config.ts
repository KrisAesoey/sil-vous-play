import type { ElectrobunConfig } from "electrobun"

export default {
	app: {
		name: "sil-vous-play",
		identifier: "sil-vous-play.electrobun.dev",
		version: "0.1.0",
	},
	build: {
		views: {
			mainview: {
				entrypoint: "src/mainview/index.tsx",
			},
		},
		copy: {
			"src/mainview/assets": "views/mainview/assets",
			"src/mainview/index.tsx": "views/mainview/index.tsx",
			"src/mainview/index.html": "views/mainview/index.html",
		},
		mac: {
			bundleCEF: false,
		},
		linux: {
			bundleCEF: false,
		},
		win: {
			bundleCEF: false,
		},
	},
} satisfies ElectrobunConfig
