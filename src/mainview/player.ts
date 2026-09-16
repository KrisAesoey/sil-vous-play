import type { Electroview } from "electrobun/view"
import { useRef, useState } from "react"
import type { AudioFileFormat, TrackFile } from "../shared/audio"
import type { MyRPC } from "../shared/rpc"
import { useQueueContext } from "./queue/queueContext"

const MIME_BY_FORMAT: Record<AudioFileFormat, string> = {
	flac: "audio/flac",
	mp3: "audio/mpeg",
	ogg: "audio/ogg",
}

type Props = {
	rpc: ReturnType<typeof Electroview.defineRPC<MyRPC>>
	onTrackChange?: (newDir: string, newTrack: number) => void
}

type UseAudioPlayer = {
	currentTrackUrl: string | undefined
	currentTrackType: string | undefined
	playSelectedTrack: (
		dir: string,
		trackList: TrackFile[],
		trackIndex: number,
	) => void
	playPrevTrack: () => void
	playNextTrack: () => void
}

export function useAudioPlayer({ rpc, onTrackChange }: Props): UseAudioPlayer {
	const { queue, head: queueHead, dequeue } = useQueueContext()

	const trackList = useRef<{ dir: string; tracks: TrackFile[] }>(undefined)
	const loadedIndex = useRef(0)

	const [currentTrackUrl, setCurrentTrackUrl] = useState<string | undefined>()
	const [currentTrackType, setCurrentTrackTypeUrl] = useState<
		string | undefined
	>()

	async function fetchAudioFile(
		directory: string,
		filename: string,
		fileExt: AudioFileFormat,
	): Promise<{ trackUrl: string; mimeType: string } | null> {
		const mimeType = MIME_BY_FORMAT[fileExt]

		const track = await rpc.request.readTrackFile({ directory, filename })
		if (!track) return null

		const base64Track = atob(track)
		const trackBytes = Uint8Array.from(base64Track, (x) => x.charCodeAt(0))
		const audioBlob = new Blob([trackBytes], { type: mimeType })
		const trackUrl = URL.createObjectURL(audioBlob)

		return { trackUrl, mimeType }
	}

	async function loadTrackAt(index: number) {
		const album = trackList.current
		if (!album) return

		const selectedTrack = album.tracks[index]
		if (!selectedTrack) {
			console.log("Could not find selected track:", index)
			return
		}

		loadedIndex.current = index
		loadTrack(album.dir, selectedTrack)
	}

	async function loadTrack(dir: string, track: TrackFile) {
		// check if we have the file preloaded in the cache before we fetch it
		const cacheKey = getCacheKey(dir, track)
		const pending = preloadCache.current.get(cacheKey)
		preloadCache.current.delete(cacheKey)

		const audioFile = await (pending ??
			fetchAudioFile(dir, track.file, track.format))
		if (!audioFile) {
			console.log("Could not load audioFile from Bun:", track.file)
			return
		}

		if (onTrackChange) {
			onTrackChange(dir, track.trackNumber)
		}

		// avoid memory leaking old blob URLs when new ones are fetched
		if (currentTrackUrl) {
			URL.revokeObjectURL(currentTrackUrl)
		}

		setCurrentTrackUrl(audioFile.trackUrl)
		setCurrentTrackTypeUrl(audioFile.mimeType)
		console.log("Successfully update track to:", track.title)

		preloadNeighbors()
		console.log("Preloaded neighbors for current track:", cacheKey)
	}

	function playSelectedTrack(
		dir: string,
		tracks: TrackFile[],
		trackNumber: number,
	) {
		trackList.current = { dir, tracks }
		const index = tracks.findIndex((t) => t.trackNumber === trackNumber)
		if (index === -1) return
		loadTrackAt(index)
	}

	function playPrevTrack() {
		const len = trackList.current?.tracks.length ?? 0
		loadTrackAt(getPrevIndex(loadedIndex.current, len))
	}

	function playNextTrack() {
		// TODO (race-condition): Can experience stale reference causing dequeue without ever playing next track
		if (queueHead) {
			dequeue()
			loadTrack(queueHead.dir, queueHead.track)
			return
		}

		const len = trackList.current?.tracks.length ?? 0
		loadTrackAt(getNextIndex(loadedIndex.current, len))
	}

	// store a cache of preloaded tracks that the user can easily navigate to
	const preloadCache = useRef(
		new Map<string, Promise<{ trackUrl: string; mimeType: string } | null>>(),
	)

	function preloadNeighbors() {
		const album = trackList.current
		const len = trackList.current?.tracks.length ?? 0

		const prev = album?.tracks[getPrevIndex(loadedIndex.current, len)]

		const next =
			queue[1] ??
			(album && {
				dir: album.dir,
				track: album.tracks[getNextIndex(loadedIndex.current, len)],
			})

		const keep = new Set<string>()

		if (album && prev) {
			preloadTrack(album.dir, prev)
			keep.add(getCacheKey(album.dir, prev))
		}
		if (next) {
			preloadTrack(next.dir, next.track)
			keep.add(getCacheKey(next.dir, next.track))
		}

		// remove all preloads that no longer apply to the current track
		for (const [cacheKey, promise] of preloadCache.current) {
			if (keep.has(cacheKey)) continue
			promise.then((result) => result && URL.revokeObjectURL(result.trackUrl))
			preloadCache.current.delete(cacheKey)
		}
	}

	function preloadTrack(dir: string, track: TrackFile) {
		const cacheKey = getCacheKey(dir, track)
		if (preloadCache.current.has(cacheKey)) return

		const audioFile = fetchAudioFile(dir, track.file, track.format)
		preloadCache.current.set(cacheKey, audioFile)

		audioFile.then((result) => {
			if (!result) preloadCache.current.delete(cacheKey)
		})
	}

	return {
		currentTrackUrl,
		currentTrackType,
		playSelectedTrack,
		playNextTrack,
		playPrevTrack,
	}
}

function getPrevIndex(index: number, trackListLen: number): number {
	if (index === 0) return trackListLen - 1
	return index - 1
}

function getNextIndex(index: number, trackListLen: number): number {
	if (index === trackListLen - 1) return 0
	return index + 1
}

function getCacheKey(dir: string, track: TrackFile) {
	return `${dir}/${track.file}`
}
