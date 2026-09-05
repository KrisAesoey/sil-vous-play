import type { RefObject } from "react"
import {
	IoPause,
	IoPlay,
	IoPlaySkipBack,
	IoPlaySkipForward,
} from "react-icons/io5"
import { usePlaybackContext } from "../../../playback/playbackContext"
import { IconButton } from "../../IconButton/IconButton"
import styles from "./Controls.module.css"

type Props = {
	audioRef: RefObject<HTMLAudioElement | null>
	playNextTrack: () => void
	playPrevTrack: () => void
}

export function Controls({ audioRef, playNextTrack, playPrevTrack }: Props) {
	const { isPlaying, toggle: togglePlay } = usePlaybackContext()

	function handleRewind() {
		if (audioRef.current === null) return
		if (audioRef.current.currentTime < 2) {
			playPrevTrack()
		} else {
			audioRef.current.currentTime = 0
		}
	}

	const PrevButton = () => (
		<IconButton onClick={handleRewind} variant="ghost">
			<IoPlaySkipBack />
		</IconButton>
	)

	const NextButton = () => (
		<IconButton onClick={playNextTrack} variant="ghost">
			<IoPlaySkipForward />
		</IconButton>
	)

	return (
		<div className={styles.container}>
			<PrevButton />
			<IconButton onClick={togglePlay} variant="primary">
				{isPlaying ? <IoPause /> : <IoPlay />}
			</IconButton>
			<NextButton />
		</div>
	)
}
