import path from "node:path"

import { type LibraryMetadata, LibraryMetadataSchema } from "../../shared/audio"
import { METADATA_FILENAME } from "./config"

export async function loadLibrary(
	dir: string,
): Promise<LibraryMetadata | null> {
	const metadataPath = path.join(dir, METADATA_FILENAME)
	const metadataFile = Bun.file(metadataPath)

	if (!(await metadataFile.exists())) return null

	const metadata = LibraryMetadataSchema.safeParse(await metadataFile.json())

	if (!metadata.success) {
		console.log(
			"Invalid library metadata file, could not parse:",
			metadata.error,
		)
		return null
	}
	return metadata.data
}
