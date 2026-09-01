import { useEffect, useState } from "react"
import { useDebounce } from "../../../debounce"
import { useUserSettingsContext } from "../../../userSettings/userSettingsContext"

export function usePersistedVolume() {
	const {
		userSettings,
		updateUserSettings,
		isLoaded: isUserSettingsLoaded,
	} = useUserSettingsContext()

	const [muted, setMuted] = useState(false)
	const [volume, setVolume] = useState(userSettings.volume)
	const debouncedVolume = useDebounce(volume, 500)

	// load saved userSettings as initial volume
	// biome-ignore lint/correctness/useExhaustiveDependencies: don't rerun when user settings update
	useEffect(() => {
		if (!isUserSettingsLoaded) return
		setVolume(userSettings.volume)
	}, [isUserSettingsLoaded])

	// save the wanted volume to userSettings. Use debounce value for less disk writes
	// biome-ignore lint/correctness/useExhaustiveDependencies: dont rerun on reloaded settings
	useEffect(() => {
		if (!isUserSettingsLoaded) return
		updateUserSettings({ volume: debouncedVolume })
	}, [debouncedVolume])

	return {
		volume,
		setVolume,
		muted,
		toggleMute: () => setMuted((m) => !m),
	}
}
