import type { Electroview } from "electrobun/view"
import { useRef, useState } from "react"
import type { AudioFileFormat, TrackFile } from "../shared/audio"
import type { MyRPC } from "../shared/rpc"

const MIME_BY_FORMAT: Record<AudioFileFormat, string> = {
	flac: "audio/flac",
	mp3: "audio/mpeg",
	ogg: "audio/ogg",
}

type Props = {
	rpc: ReturnType<typeof Electroview.defineRPC<MyRPC>>
	onTrackChange?: (newDir: string, newTrack: number) => void
}

type UseAdioPlayer = {
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

export function useAudioPlayer({ rpc, onTrackChange }: Props): UseAdioPlayer {
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

		// check if we have the file preloaded in the cache before we fetch it
		const pending = preloadCache.current.get(index)
		preloadCache.current.delete(index)

		const audioFile = await (pending ??
			fetchAudioFile(album.dir, selectedTrack.file, selectedTrack.format))
		if (!audioFile) {
			console.log("Could not load audioFile from Bun:", selectedTrack.file)
			return
		}

		loadedIndex.current = index

		if (onTrackChange) {
			onTrackChange(album.dir, selectedTrack.track)
		}

		// avoid memory leaking old blob URLs when new ones are fetched
		if (currentTrackUrl) {
			URL.revokeObjectURL(currentTrackUrl)
		}

		setCurrentTrackUrl(audioFile.trackUrl)
		setCurrentTrackTypeUrl(audioFile.mimeType)
		console.log("Successfully update track to:", selectedTrack.title)

		preloadNeighbors(index)
		console.log("Preloaded neighbors for current track:", index)
	}

	function playSelectedTrack(
		dir: string,
		tracks: TrackFile[],
		trackNumber: number,
	) {
		trackList.current = { dir, tracks }
		const index = tracks.findIndex((t) => t.track === trackNumber)
		if (index === -1) return
		loadTrackAt(index)
	}

	function playPrevTrack() {
		const len = trackList.current?.tracks.length ?? 0
		loadTrackAt(getPrevIndex(loadedIndex.current, len))
	}

	function playNextTrack() {
		const len = trackList.current?.tracks.length ?? 0
		loadTrackAt(getNextIndex(loadedIndex.current, len))
	}

	// store a cache of preloaded tracks that the user can easily navigate to
	const preloadCache = useRef(
		new Map<number, Promise<{ trackUrl: string; mimeType: string } | null>>(),
	)

	function preloadTrackAt(index: number) {
		const album = trackList.current
		if (!album) return

		const track = album.tracks[index]
		if (!track || preloadCache.current.has(index)) return

		const audioFile = fetchAudioFile(album.dir, track.file, track.format)
		preloadCache.current.set(index, audioFile)

		audioFile.then((result) => {
			if (!result) preloadCache.current.delete(index)
		})
	}

	function preloadNeighbors(index: number) {
		const len = trackList.current?.tracks.length ?? 0
		const prevIndex = getPrevIndex(index, len)
		const nextIndex = getNextIndex(index, len)
		preloadTrackAt(prevIndex)
		preloadTrackAt(nextIndex)

		// remove all preloads that no longer apply to the current track
		const keep = new Set([index, prevIndex, nextIndex])
		for (const [cachedIndex, promise] of preloadCache.current) {
			if (keep.has(cachedIndex)) continue
			promise.then((result) => result && URL.revokeObjectURL(result.trackUrl))
			preloadCache.current.delete(cachedIndex)
		}
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
