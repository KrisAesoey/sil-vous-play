import type { Dirent } from "node:fs"
import { readdir } from "node:fs/promises"
import path from "node:path"
import {
	type AlbumMetadata,
	AUDIO_FILE_FORMATS,
	type AudioFileFormat,
	type LibraryMetadata,
	type Metadata,
	MetadataSchema,
	type TrackFile,
} from "../../shared/audio"
import { METADATA_FILENAME } from "./config"

function isAudioFileFormat(value: string): value is AudioFileFormat {
	return (AUDIO_FILE_FORMATS as readonly string[]).includes(value)
}

function getFileExtension(file: Dirent): string {
	return path.extname(file.name).slice(1).toLowerCase()
}

function includeDirectory(entries: Dirent[]) {
	const hasAudioFiles = entries.some((entry) => {
		if (entry.isDirectory()) return false
		return isAudioFileFormat(getFileExtension(entry))
	})

	const hasMetadataFile = entries.some(
		(entry) => entry.name === METADATA_FILENAME,
	)

	return hasAudioFiles || hasMetadataFile
}

async function readMetadataFile(dir: string): Promise<Metadata | null> {
	const metadataPath = path.join(dir, METADATA_FILENAME)
	const metadataFile = Bun.file(metadataPath)

	if (!(await metadataFile.exists())) return null

	const metadata = MetadataSchema.safeParse(await metadataFile.json())

	if (!metadata.success) {
		console.log("Invalid metadata file, could not parse:", metadata.error)
		return null
	}
	return metadata.data
}

async function writeMetadataFile(dir: string, metadata: Metadata) {
	const metadataPath = path.join(dir, METADATA_FILENAME)
	await Bun.write(metadataPath, JSON.stringify(metadata, null, 2))
}

function createAlbumMetadata(
	albumPath: string,
	entries: Dirent[],
): AlbumMetadata {
	let trackIndex = 0

	const trackFiles: TrackFile[] = entries.flatMap((entry): TrackFile[] => {
		if (entry.isDirectory()) return []

		const ext = getFileExtension(entry)
		if (!isAudioFileFormat(ext)) return []

		trackIndex += 1

		return [
			{
				file: entry.name,
				title: entry.name,
				format: ext,
				track: trackIndex,
			},
		]
	})

	return {
		title: path.basename(albumPath),
		tracks: trackFiles,
		type: "album",
		version: 1,
	}
}

async function scanDirectory(dir: string): Promise<string[]> {
	const entries = await readdir(dir, { withFileTypes: true })

	if (!includeDirectory(entries)) return []

	const existing = await readMetadataFile(dir)
	if (!existing) {
		await writeMetadataFile(dir, createAlbumMetadata(dir, entries))
	}

	const subDirs = entries.filter((entry) => entry.isDirectory())

	const results = await Promise.all(
		subDirs.map((sub) => scanDirectory(path.join(dir, sub.name))),
	)
	return [dir, ...results.flat()]
}

async function scanSubDirectories(dir: string): Promise<string[]> {
	const entries = await readdir(dir, { withFileTypes: true })
	const subDirs = entries.filter((entry) => entry.isDirectory())
	const results = await Promise.all(
		subDirs.map((sub) => scanDirectory(path.join(dir, sub.name))),
	)
	return results.flat()
}

export async function createLibraryMetadata(
	dir: string,
): Promise<LibraryMetadata> {
	const albumPaths = await scanSubDirectories(dir)

	const metadata: LibraryMetadata = {
		type: "library",
		version: 1,
		albumPaths,
	}
	await writeMetadataFile(dir, metadata)

	return metadata
}

export async function readOrCreateLibraryMetadata(
	dir: string,
): Promise<LibraryMetadata> {
	const metadata = await readMetadataFile(dir)

	if (metadata && metadata.type === "library") return metadata

	return createLibraryMetadata(dir)
}
