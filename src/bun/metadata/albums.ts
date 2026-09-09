import type { Dirent } from "node:fs"
import path from "node:path"
import {
	type AlbumEntry,
	type AlbumMetadata,
	AlbumMetadataSchema,
	type TrackFile,
} from "../../shared/audio"
import { METADATA_FILENAME } from "./config"
import { getAudioTags } from "./tracks"
import { getFileExtension, isAudioFileFormat } from "./utils"

export async function createAlbumMetadata(
	albumPath: string,
	entries: Dirent[],
): Promise<AlbumMetadata> {
	const audioEntries = entries
		.map((entry) => {
			if (entry.isDirectory()) return null

			const ext = getFileExtension(entry)
			if (!isAudioFileFormat(ext)) return null

			return { entry, ext }
		})
		.filter((entry) => entry !== null)
		.sort((a, b) =>
			path
				.parse(a.entry.name)
				.name.localeCompare(path.parse(b.entry.name).name),
		)

	const audioFilesWithTags = await Promise.all(
		audioEntries.map(({ entry }) => getAudioTags(albumPath, entry)),
	)

	const trackNumbers = resolveTrackNumbers(
		audioFilesWithTags.map((audio) => audio.trackNumber),
	)

	const trackFiles: TrackFile[] = audioEntries.map(({ entry, ext }, index) => {
		return <TrackFile>{
			duration: audioFilesWithTags[index].duration,
			file: entry.name,
			format: ext,
			title: audioFilesWithTags[index].title ?? path.parse(entry.name).name,
			trackNumber: trackNumbers[index],
		}
	})

	return {
		title: path.basename(albumPath),
		tracks: trackFiles,
		type: "album",
		version: 1,
	}
}

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

function resolveTrackNumbers(trackNumberTags: (number | null)[]): number[] {
	const usableTags = longestIncreasingRun(trackNumberTags)
	const result: number[] = new Array(trackNumberTags.length)

	let lastTrack = 0
	for (let i = 0; i < trackNumberTags.length; i++) {
		// biome-ignore lint/style/noNonNullAssertion: longest increasing run return 1-to-1 length
		lastTrack = usableTags[i] ? trackNumberTags[i]! : lastTrack + 1
		result[i] = lastTrack
	}
	return result
}

/**
 * Algorithm for finding the longest increasing sub sequence of a number array.
 * @param nums the sequence of numbers to find the subsequence of
 * @returns
 */
function longestIncreasingRun(nums: (number | null)[]): boolean[] {
	// Keeps track of how many increasing numbers are found for each number
	const runLength = nums.map(() => 1)
	// Pointer to the previous number for this index in its longest sequence
	const prev = nums.map(() => -1)
	let bestEnd = -1

	for (let i = 0; i < nums.length; i++) {
		if (nums[i] === null) continue
		for (let j = 0; j < i; j++) {
			// biome-ignore lint/style/noNonNullAssertion: already null checked
			if (nums[j] === null || nums[j]! >= nums[i]!) continue
			// if the next number is greater than the one were at
			if (runLength[j] + 1 > runLength[i]) {
				runLength[i] = runLength[j] + 1
				prev[i] = j
			}
		}
		if (bestEnd === -1 || runLength[i] > runLength[bestEnd]) {
			bestEnd = i
		}
	}

	const kept = nums.map(() => false)
	for (let i = bestEnd; i !== -1; i = prev[i]) {
		kept[i] = true
	}
	return kept
}
