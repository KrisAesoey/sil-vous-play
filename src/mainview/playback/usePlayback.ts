import { useState } from "react"

export type NowPlaying = { albumDir: string; trackNumber: number }
export type UsePlayback = {
	nowPlaying: NowPlaying | undefined
	setNowPlaying: (newPlaying: NowPlaying) => void
}

export function usePlayback(): UsePlayback {
	const [nowPlaying, setNowPlaying] = useState<NowPlaying>()

	return {
		nowPlaying,
		setNowPlaying,
	}
}
