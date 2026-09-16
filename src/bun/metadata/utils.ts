import type { Dirent } from "node:fs"
import path from "node:path"
import { AUDIO_FILE_FORMATS, type AudioFileFormat } from "../../shared/audio"

export function getFileExtension(file: Dirent): string {
	return path.extname(file.name).slice(1).toLowerCase()
}

export function isAudioFileFormat(value: string): value is AudioFileFormat {
	return (AUDIO_FILE_FORMATS as readonly string[]).includes(value)
}

export function isImageExtension(ext: string): boolean {
	const imageExtensions = ["jpg", "jpeg", "png", "webp"]

	return imageExtensions.includes(ext)
}
