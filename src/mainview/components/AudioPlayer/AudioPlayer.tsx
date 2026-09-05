import { useEffect, useRef } from "react"
import { usePlaybackContext } from "../../playback/playbackContext"
import styles from "./AudioPlayer.module.css"
import { Controls } from "./Controls/Controls"
import { ProgressBar } from "./ProgressBar/ProgressBar"
import { VolumeSlider } from "./VolumeSilder/VolumeSlider"

type Props = {
	playNextTrack: () => void
	playPrevTrack: () => void
	currentTrackUrl?: string
	currentTrackType?: string
}

export function AudioPlayer({
	currentTrackUrl,
	currentTrackType,
	playNextTrack,
	playPrevTrack,
}: Props) {
	const { isPlaying } = usePlaybackContext()

	const audioRef = useRef<HTMLAudioElement | null>(null)
	const volumeRef = useRef<HTMLInputElement>(null)
	const progressBarRef = useRef<HTMLInputElement>(null)

	// play the newly loaded track instantly if the previous was playing but now if paused
	// biome-ignore lint/correctness/useExhaustiveDependencies: re-run when track changes
	useEffect(() => {
		const audio = audioRef.current
		if (audio === null) return
		isPlaying ? audio.play() : audio.pause()
	}, [audioRef, currentTrackUrl, isPlaying])

	// play next track when current finishes
	// biome-ignore lint/correctness/useExhaustiveDependencies: re-run when track changes
	useEffect(() => {
		const audio = audioRef.current
		if (audio === null) return
		audio.addEventListener("ended", playNextTrack)
		return () => audio.removeEventListener("ended", playNextTrack)
	}, [audioRef, currentTrackUrl, playNextTrack])

	return (
		<>
			{/* biome-ignore lint/a11y/useMediaCaption: music playback, no dialogue/lyrics to caption */}
			<audio
				className={styles.hiddenAudio}
				ref={audioRef}
				preload="auto"
				key={currentTrackUrl}
			>
				<source src={currentTrackUrl} type={currentTrackType} />
				Your device does not support the audio element.
			</audio>
			<div className={styles.container}>
				<VolumeSlider
					audioRef={audioRef}
					currentTrackUrl={currentTrackUrl}
					volumeRef={volumeRef}
				/>
				<Controls
					audioRef={audioRef}
					playNextTrack={playNextTrack}
					playPrevTrack={playPrevTrack}
				/>
				<ProgressBar
					audioRef={audioRef}
					currentTrackUrl={currentTrackUrl}
					progressBarRef={progressBarRef}
				/>
			</div>
		</>
	)
}
