import { type RefObject, useEffect } from "react"
import { IoVolumeMedium, IoVolumeMute } from "react-icons/io5"
import { IconButton } from "../../IconButton/IconButton"
import { usePersistedVolume } from "./usePersistedVolume"
import styles from "./VolumeSlider.module.css"

type Props = {
	audioRef: RefObject<HTMLAudioElement | null>
	volumeRef: RefObject<HTMLInputElement | null>
	currentTrackUrl?: string
}

export function VolumeSlider({ audioRef, volumeRef, currentTrackUrl }: Props) {
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
		muted || volume === 0.0 ? <IoVolumeMute /> : <IoVolumeMedium />

	return (
		<div className={styles.container}>
			<IconButton onClick={toggleMute} variant="primary">
				{renderVolumeButton()}
			</IconButton>
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
