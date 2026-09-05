import { createContext, useContext } from "react"
import { type UsePlayback, usePlayback } from "./usePlayback"

const PlaybackContext = createContext<UsePlayback | null>(null)

type Props = {
	children: React.ReactNode
}

export function PlaybackProvider({ children }: Props) {
	const value = usePlayback()

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
