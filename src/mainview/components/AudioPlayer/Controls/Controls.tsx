import { type RefObject, useEffect, useState } from "react"
import {
	SlControlEnd,
	SlControlPause,
	SlControlPlay,
	SlControlStart,
} from "react-icons/sl"

import styles from "./Controls.module.css"

type Props = {
	audioRef: RefObject<HTMLAudioElement | null>
	playNextTrack: () => void
	playPrevTrack: () => void
	currentTrackUrl?: string
}

export function Controls({
	audioRef,
	currentTrackUrl,
	playNextTrack,
	playPrevTrack,
}: Props) {
	const [isPlaying, setIsPlaying] = useState(false)

	// play the newly loaded track instantly if the previous was playing but now if paused
	// biome-ignore lint/correctness/useExhaustiveDependencies: re-run when track changes
	useEffect(() => {
		const audio = audioRef.current
		if (audio === null) return
		isPlaying ? audio.play() : audio.pause()
	}, [audioRef, currentTrackUrl, isPlaying])

	function togglePlayPause() {
		setIsPlaying((prev) => !prev)
	}

	const PlayButton = () => (
		<button className={styles.button} onClick={togglePlayPause} type="button">
			<SlControlPlay />
		</button>
	)

	const PauseButton = () => (
		<button className={styles.button} onClick={togglePlayPause} type="button">
			<SlControlPause />
		</button>
	)

	function handleRewind() {
		if (audioRef.current === null) return
		if (audioRef.current.currentTime < 2) {
			playPrevTrack()
		} else {
			audioRef.current.currentTime = 0
			setIsPlaying(true)
		}
	}

	const PrevButton = () => (
		<button className={styles.button} onClick={handleRewind} type="button">
			<SlControlStart />
		</button>
	)

	function handleForward() {
		playNextTrack()
		setIsPlaying(true)
	}

	const NextButton = () => (
		<button className={styles.button} onClick={handleForward} type="button">
			<SlControlEnd />
		</button>
	)

	return (
		<div className={styles.container}>
			<PrevButton />
			{isPlaying ? <PauseButton /> : <PlayButton />}
			<NextButton />
		</div>
	)
}
