import type { Dirent } from "node:fs"
import { readdir } from "node:fs/promises"
import path from "node:path"
import {
	AUDIO_FILE_FORMATS,
	type AudioFileFormat,
	type Metadata,
	MetadataSchema,
	type TrackFile,
} from "../shared/audio"

function isAudioFileFormat(value: string): value is AudioFileFormat {
	return (AUDIO_FILE_FORMATS as readonly string[]).includes(value)
}

function createMetadata(folderPath: string, entries: Dirent[]): Metadata {
	const trackFiles: TrackFile[] = entries.flatMap(
		(entry, index): TrackFile[] => {
			if (entry.isDirectory()) return []

			const ext = path.extname(entry.name).slice(1).toLowerCase()
			if (!isAudioFileFormat(ext)) return []

			return [
				{
					file: entry.name,
					title: entry.name,
					format: ext,
					track: index,
				},
			]
		},
	)

	return {
		title: path.basename(folderPath),
		tracks: trackFiles,
		version: 1,
	}
}

const METADATA_FILENAME = ".metadata.json"

export async function readMetadataFile(
	folderPath: string,
): Promise<Metadata | null> {
	const metadataPath = path.join(folderPath, METADATA_FILENAME)
	const metadataFile = Bun.file(metadataPath)

	if (!(await metadataFile.exists())) return null

	const parsedMetadata = MetadataSchema.safeParse(await metadataFile.json())
	if (!parsedMetadata.success) {
		console.error("Invalid metadata file:", parsedMetadata.error)
		return null
	}

	return parsedMetadata.data
}

export async function writeMetadataFile(
	folderPath: string,
	metadata: Metadata,
) {
	const metadataPath = path.join(folderPath, METADATA_FILENAME)
	await Bun.write(metadataPath, JSON.stringify(metadata, null, 2))
}

export async function readOrCreateMetadataFile(
	folderPath: string,
): Promise<Metadata> {
	const existingMetadata = await readMetadataFile(folderPath)

	if (existingMetadata) {
		console.log("Found exisiting metadata file for album")
		return existingMetadata
	}

	console.log("Creating new metadata data file for album...")
	const folderEntries = await readdir(folderPath, { withFileTypes: true })
	const newMetadata = createMetadata(folderPath, folderEntries)
	await writeMetadataFile(folderPath, newMetadata)
	console.log("Successfully created new metadata file for album")
	return newMetadata
}
