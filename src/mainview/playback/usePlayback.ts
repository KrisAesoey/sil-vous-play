import { useState } from "react"

export type NowPlaying = { albumDir: string; trackNumber: number }
export type UsePlayback = {
	isPlaying: boolean
	nowPlaying: NowPlaying | undefined
	play: (track: NowPlaying) => void
	pause: () => void
	toggle: () => void
}

/**
 * Owns the state of play. Keeps track of what is playing and if it is currently playing.
 * Provides functions to update these two states.
 */
export function usePlayback(): UsePlayback {
	const [isPlaying, setIsPlaying] = useState<boolean>(false)
	const [nowPlaying, setNowPlaying] = useState<NowPlaying>()

	const play = (track: NowPlaying) => {
		setNowPlaying(track)
		setIsPlaying(true)
	}

	const pause = () => setIsPlaying(false)

	const toggle = () => setIsPlaying((prev) => !prev)

	return {
		isPlaying,
		nowPlaying,
		play,
		pause,
		toggle,
	}
}
