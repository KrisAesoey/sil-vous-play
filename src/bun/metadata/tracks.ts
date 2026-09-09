import type { Dirent } from "node:fs"
import path from "node:path"
import { parseFile } from "music-metadata"

type TrackMetadata = {
	container?: string
	duration?: number
	title?: string
	trackNumber: number | null
}

async function parseAudioMetadata(filePath: string): Promise<TrackMetadata> {
	const audioMetadata = await parseFile(filePath)

	return {
		container: audioMetadata.format.container,
		duration: audioMetadata.format.duration,
		title: audioMetadata.common.title,
		trackNumber: audioMetadata.common.track.no,
	}
}

export type AudioTags = {
	duration: number
	trackNumber: number | null
	container?: string
	title?: string
}

export async function getAudioTags(
	dir: string,
	entry: Dirent,
): Promise<AudioTags> {
	const filePath = path.join(dir, entry.name)
	const audioMetadata = await parseAudioMetadata(filePath)

	return {
		container: audioMetadata.container,
		duration: audioMetadata.duration ?? 0,
		trackNumber: audioMetadata.trackNumber,
		title: audioMetadata.title,
	}
}
