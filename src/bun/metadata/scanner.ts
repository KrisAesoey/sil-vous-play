import type { Dirent } from "node:fs"
import { readdir } from "node:fs/promises"
import path from "node:path"
import {
	type LibraryMetadata,
	type Metadata,
	MetadataSchema,
} from "../../shared/audio"
import { createAlbumMetadata } from "./albums"
import { METADATA_FILENAME } from "./config"
import { getFileExtension, isAudioFileFormat } from "./utils"

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

async function scanDirectory(dir: string): Promise<string[]> {
	const entries = await readdir(dir, { withFileTypes: true })

	if (!includeDirectory(entries)) return []

	const existing = await readMetadataFile(dir)
	if (!existing) {
		await writeMetadataFile(dir, await createAlbumMetadata(dir, entries))
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
