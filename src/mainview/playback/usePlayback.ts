import { useState } from "react"
import type { TrackFile } from "../../shared/audio"

type Album = {
	title: string
	tracks: TrackFile[]
	artist?: string
	artwork?: string
	year?: string
}

export type UsePlayback = {
	currentAlbum: Album | undefined
	setCurrentAlbum: (newAlbum: Album) => void
	currentTrackIndex: number | undefined
	setCurrentTrackIndex: (newTrackIndex: number) => void
}

export function usePlayback(): UsePlayback {
	const [currentAlbum, setCurrentAlbum] = useState<Album>()
	const [currentTrackIndex, setCurrentTrackIndex] = useState<number>()

	return {
		currentAlbum,
		setCurrentAlbum,
		currentTrackIndex,
		setCurrentTrackIndex,
	}
}
