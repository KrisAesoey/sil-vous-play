import { type RefObject, useEffect, useState } from "react"
import {
	IoPause,
	IoPlay,
	IoPlaySkipBack,
	IoPlaySkipForward,
} from "react-icons/io5"
import { IconButton } from "../../IconButton/IconButton"
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
		<IconButton onClick={togglePlayPause} variant="ghost">
			<IoPlay />
		</IconButton>
	)

	const PauseButton = () => (
		<IconButton onClick={togglePlayPause} variant="ghost">
			<IoPause />
		</IconButton>
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
		<IconButton onClick={handleRewind} variant="ghost">
			<IoPlaySkipBack />
		</IconButton>
	)

	function handleForward() {
		playNextTrack()
		setIsPlaying(true)
	}

	const NextButton = () => (
		<IconButton onClick={handleForward} variant="ghost">
			<IoPlaySkipForward />
		</IconButton>
	)

	return (
		<div className={styles.container}>
			<PrevButton />
			{isPlaying ? <PauseButton /> : <PlayButton />}
			<NextButton />
		</div>
	)
}
