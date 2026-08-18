import type { ElectrobunConfig } from "electrobun"

export default {
	app: {
		name: "sil-vous-play",
		identifier: "sil-vous-play.electrobun.dev",
		version: "0.0.1",
	},
	build: {
		views: {
			mainview: {
				entrypoint: "src/mainview/index.tsx",
			},
		},
		copy: {
			"src/mainview/index.tsx": "views/mainview/index.tsx",
			"src/mainview/index.html": "views/mainview/index.html",
			"src/mainview/layer_cake.flac": "views/mainview/layer_cake.flac",
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
