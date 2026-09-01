import path from "node:path"

import {
	type AlbumEntry,
	type AlbumMetadata,
	AlbumMetadataSchema,
} from "../../shared/audio"
import { METADATA_FILENAME } from "./config"

async function loadAlbum(dir: string): Promise<AlbumMetadata | null> {
	const metadataPath = path.join(dir, METADATA_FILENAME)
	const metadataFile = Bun.file(metadataPath)

	if (!(await metadataFile.exists())) return null

	const metadata = AlbumMetadataSchema.safeParse(await metadataFile.json())

	if (!metadata.success) {
		console.log("Invalid album metadata file, could not parse:", metadata.error)
		return null
	}
	return metadata.data
}

export async function loadAlbums(albumPaths: string[]): Promise<AlbumEntry[]> {
	const albums = await Promise.all(
		albumPaths.map(async (dir) => {
			const album = await loadAlbum(dir)
			return album ? { album, dir } : null
		}),
	)

	return albums.filter((album) => album != null)
}
