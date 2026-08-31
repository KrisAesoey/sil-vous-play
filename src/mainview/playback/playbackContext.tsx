import { createContext, useContext, useMemo } from "react"
import { type UsePlayback, usePlayback } from "./usePlayback"

const PlaybackContext = createContext<UsePlayback | null>(null)

type Props = {
	children: React.ReactNode
}

export function PlaybackProvider({ children }: Props) {
	const {
		currentAlbum,
		setCurrentAlbum,
		currentTrackIndex,
		setCurrentTrackIndex,
	} = usePlayback()

	// Every time usePlayback run the values because a fresh object
	// so we memo them to only change if any of the pieces actually changes
	const value = useMemo(
		() => ({
			currentAlbum,
			setCurrentAlbum,
			currentTrackIndex,
			setCurrentTrackIndex,
		}),
		[currentAlbum, setCurrentAlbum, currentTrackIndex, setCurrentTrackIndex],
	)

	return (
		<PlaybackContext.Provider value={value}>
			{children}
		</PlaybackContext.Provider>
	)
}

export function usePlaybackContext() {
	const ctx = useContext(PlaybackContext)
	if (ctx === null)
		throw new Error("usePlaybackContext used outside PlaybackProvider")
	return ctx
}
