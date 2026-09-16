import path from "node:path"

import { loadAlbum } from "./metadata/albums"

/**
 * Creates a map of albums with cover images and their corresponding image files.
 * @param albumPaths The album directories to find cover image files in
 */
export async function loadCovers(
	albumPaths: string[],
): Promise<Record<string, string>> {
	const coverMap: Record<string, string> = {}

	await Promise.all(
		albumPaths.map(async (albumPath) => {
			const albumMetadata = await loadAlbum(albumPath)
			if (albumMetadata === null) return
			if (!albumMetadata.cover) return

			const coverPath = path.join(albumPath, albumMetadata.cover)
			const coverBytes = await Bun.file(coverPath).bytes()
			const coverEncoded = Buffer.from(coverBytes).toString("base64")

			coverMap[albumPath] = coverEncoded
		}),
	)

	return coverMap
}
