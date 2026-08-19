import { type RefObject, useEffect } from "react"
import { SlVolume2, SlVolumeOff } from "react-icons/sl"
import { usePersistedVolume } from "./usePersistedVolume"

type VolumeProps = {
	audioRef: RefObject<HTMLAudioElement | null>
	volumeRef: RefObject<HTMLInputElement | null>
	currentTrackUrl?: string
}

export function VolumeSlider({
	audioRef,
	volumeRef,
	currentTrackUrl,
}: VolumeProps) {
	const { volume, setVolume, muted, toggleMute } = usePersistedVolume()

	// set the volume of a new track to be the selected volume, instead of default = 1
	// biome-ignore lint/correctness/useExhaustiveDependencies: re-run when track changes
	useEffect(() => {
		const audio = audioRef.current
		if (audio === null) return
		audio.volume = muted ? 0 : volume
	}, [audioRef, currentTrackUrl, muted, volume])

	const handleVolumeChange = () => {
		const volume = volumeRef.current
		if (volume === null) return
		setVolume(volume.valueAsNumber)
	}

	const renderVolumeButton = () =>
		muted || volume === 0.0 ? <SlVolumeOff /> : <SlVolume2 />

	return (
		<div>
			<button onClick={toggleMute} type="button">
				{renderVolumeButton()}
			</button>
			<input
				defaultValue={0.0}
				max={1.0}
				onChange={handleVolumeChange}
				ref={volumeRef}
				step={0.01}
				type="range"
				value={muted ? 0.0 : volume}
			/>
		</div>
	)
}
