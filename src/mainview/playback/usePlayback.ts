import { useState } from "react"
import type { AlbumEntry } from "../../shared/audio"

export type UsePlayback = {
	currentAlbum: AlbumEntry | undefined
	setCurrentAlbum: (newAlbum: AlbumEntry) => void
	currentTrackIndex: number | undefined
	setCurrentTrackIndex: (newTrackIndex: number) => void
}

export function usePlayback(): UsePlayback {
	const [currentAlbum, setCurrentAlbum] = useState<AlbumEntry>()
	const [currentTrackIndex, setCurrentTrackIndex] = useState<number>()

	return {
		currentAlbum,
		setCurrentAlbum,
		currentTrackIndex,
		setCurrentTrackIndex,
	}
}
