import { z } from "zod"

export const AUDIO_FILE_FORMATS = ["flac", "mp3", "ogg"] as const
export type AudioFileFormat = (typeof AUDIO_FILE_FORMATS)[number]

// bun schemas for file valdiation

const AudioFileFormatSchema = z.enum(AUDIO_FILE_FORMATS)

const TrackFileSchema = z.object({
	file: z.string(),
	title: z.string(),
	format: AudioFileFormatSchema,
	track: z.number(),
})

const BaseMetadataScehma = z.object({
	version: z.number(),
})

export const AlbumMetadataSchema = BaseMetadataScehma.extend({
	type: z.literal("album"),
	title: z.string(),
	tracks: z.array(TrackFileSchema),
	version: z.number(),
	artist: z.string().optional(),
	artwork: z.string().optional(),
	year: z.string().optional(),
})

export const LibraryMetadataSchema = BaseMetadataScehma.extend({
	type: z.literal("library"),
	albumPaths: z.array(z.string()),
})

export const MetadataSchema = z.discriminatedUnion("type", [
	AlbumMetadataSchema,
	LibraryMetadataSchema,
])

export type TrackFile = z.infer<typeof TrackFileSchema>
export type AlbumMetadata = z.infer<typeof AlbumMetadataSchema>
export type LibraryMetadata = z.infer<typeof LibraryMetadataSchema>
export type Metadata = z.infer<typeof MetadataSchema>

// view types for rendering information

export type AlbumEntry = {
	album: AlbumMetadata
	dir: string
}
