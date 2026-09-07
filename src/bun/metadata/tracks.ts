import type { Dirent } from "node:fs"
import path from "node:path"
import { parseFile } from "music-metadata"
import {
	AUDIO_FILE_FORMATS,
	type AudioFileFormat,
	type TrackFile,
} from "../../shared/audio"

function isAudioFileFormat(value: string): value is AudioFileFormat {
	return (AUDIO_FILE_FORMATS as readonly string[]).includes(value)
}

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

export async function getTrackMetadata(
	dir: string,
	entry: Dirent,
	ext: AudioFileFormat,
	albumNumber: number,
): Promise<TrackFile | null> {
	const filePath = path.join(dir, entry.name)
	const audioMetadata = await parseAudioMetadata(filePath)

	const duration = audioMetadata.duration ?? 0
	const title = audioMetadata.title ?? path.parse(entry.name).name
	const trackNumber =
		audioMetadata.trackNumber != null ? audioMetadata.trackNumber : albumNumber

	const format = () => {
		const metadataFormat = audioMetadata.container
		if (!metadataFormat || !isAudioFileFormat(metadataFormat)) {
			return ext
		}
		return metadataFormat
	}

	return {
		duration,
		file: entry.name,
		title,
		format: format(),
		trackNumber,
	}
}
