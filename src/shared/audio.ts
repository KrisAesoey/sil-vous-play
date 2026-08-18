import { z } from "zod"

export const AUDIO_FILE_FORMATS = ["flac", "mp3", "ogg"] as const
export type AudioFileFormat = (typeof AUDIO_FILE_FORMATS)[number]

const AudioFileFormatSchema = z.enum(AUDIO_FILE_FORMATS)

const TrackFileSchema = z.object({
	file: z.string(),
	title: z.string(),
	format: AudioFileFormatSchema,
	track: z.number(),
})

export const MetadataSchema = z.object({
	title: z.string(),
	tracks: z.array(TrackFileSchema),
	version: z.number(),
	artist: z.string().optional(),
	artwork: z.string().optional(),
	year: z.string().optional(),
})

export type TrackFile = z.infer<typeof TrackFileSchema>
export type Metadata = z.infer<typeof MetadataSchema>
