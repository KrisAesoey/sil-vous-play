import { type RefObject, useEffect, useRef } from "react"
import styles from "./AudioPlayer.module.css"
import { Controls } from "./Controls/Controls"
import { ProgressBar } from "./ProgressBar/ProgressBar"
import { VolumeSlider } from "./VolumeSilder/VolumeSlider"

type Props = {
	audioRef: RefObject<HTMLAudioElement | null>
	playNextTrack: () => void
	playPrevTrack: () => void
	currentTrackUrl?: string
}

export function AudioPlayer({
	audioRef,
	currentTrackUrl,
	playNextTrack,
	playPrevTrack,
}: Props) {
	const volumeRef = useRef<HTMLInputElement>(null)
	const progressBarRef = useRef<HTMLInputElement>(null)

	// play next track when current finishes
	// biome-ignore lint/correctness/useExhaustiveDependencies: re-run when track changes
	useEffect(() => {
		const audio = audioRef.current
		if (audio === null) return
		audio.addEventListener("ended", playNextTrack)
		return () => audio.removeEventListener("ended", playNextTrack)
	}, [audioRef, currentTrackUrl, playNextTrack])

	return (
		<div className={styles.container}>
			<VolumeSlider
				audioRef={audioRef}
				currentTrackUrl={currentTrackUrl}
				volumeRef={volumeRef}
			/>
			<Controls
				audioRef={audioRef}
				currentTrackUrl={currentTrackUrl}
				playNextTrack={playNextTrack}
				playPrevTrack={playPrevTrack}
			/>
			<ProgressBar
				audioRef={audioRef}
				currentTrackUrl={currentTrackUrl}
				progressBarRef={progressBarRef}
			/>
		</div>
	)
}
