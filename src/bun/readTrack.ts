import path from "node:path"

export async function readTrackFile(
	folderPath: string,
	filename: string,
): Promise<string> {
	const filePath = path.join(folderPath, filename)
	const bytes = await Bun.file(filePath).bytes()
	return Buffer.from(bytes).toString("base64")
}
