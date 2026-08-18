import { type RefObject, useEffect, useRef, useState } from "react"

import {
	SlControlEnd,
	SlControlPause,
	SlControlPlay,
	SlControlStart,
	SlVolume2,
	SlVolumeOff,
} from "react-icons/sl"

import styles from "./AudioPlayer.module.css"

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
		<div>
			<AudioControls
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
			<VolumeSlider
				audioRef={audioRef}
				currentTrackUrl={currentTrackUrl}
				volumeRef={volumeRef}
			/>
		</div>
	)
}

type ControlsProps = {
	audioRef: RefObject<HTMLAudioElement | null>
	playNextTrack: () => void
	playPrevTrack: () => void
	currentTrackUrl?: string
}

function AudioControls({
	audioRef,
	currentTrackUrl,
	playNextTrack,
	playPrevTrack,
}: ControlsProps) {
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
		<div style={{ display: "flex", flexDirection: "row", gap: "2rem" }}>
			<PrevButton />
			{isPlaying ? <PauseButton /> : <PlayButton />}
			<NextButton />
		</div>
	)
}

type VolumeProps = {
	audioRef: RefObject<HTMLAudioElement | null>
	volumeRef: RefObject<HTMLInputElement | null>
	currentTrackUrl?: string
}

function VolumeSlider({ audioRef, volumeRef, currentTrackUrl }: VolumeProps) {
	const [muted, setMuted] = useState(false)
	const [volume, setVolume] = useState(1.0)

	// set the volume of a new track to be the selected volume, instead of default = 1
	// biome-ignore lint/correctness/useExhaustiveDependencies: re-run when track changes
	useEffect(() => {
		const audio = audioRef.current
		if (audio === null) return
		audio.volume = muted ? 0 : volume
	}, [audioRef, currentTrackUrl, muted, volume])

	const handleVolumeChange = () => {
		const audio = audioRef.current
		const volume = volumeRef.current
		if (audio === null || volume === null) return

		audio.volume = volume.valueAsNumber
		setVolume(volume.valueAsNumber)
	}

	const handleVolumeButtonClick = () => {
		setMuted((prev) => !prev)
	}

	const renderVolumeButton = () =>
		muted || volume === 0.0 ? <SlVolumeOff /> : <SlVolume2 />

	return (
		<div>
			<button onClick={handleVolumeButtonClick} type="button">
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

type ProgressProps = {
	audioRef: RefObject<HTMLAudioElement | null>
	progressBarRef: RefObject<HTMLInputElement | null>
	currentTrackUrl?: string
}

function ProgressBar({
	audioRef,
	currentTrackUrl,
	progressBarRef,
}: ProgressProps) {
	const [timeProgress, setTimeProgress] = useState(0)
	const [duration, setDuration] = useState(0)

	const handleProgressChange = () => {
		const audio = audioRef.current
		const progressBar = progressBarRef.current
		if (audio === null || progressBar === null) return
		audio.currentTime = progressBar.valueAsNumber
		setTimeProgress(progressBar.valueAsNumber)
	}

	// // Update the progress and duration of a track based on audio events
	// biome-ignore lint/correctness/useExhaustiveDependencies: re-run when track changes
	useEffect(() => {
		const audio = audioRef.current
		if (audio === null) return

		const updateProgress = () => setTimeProgress(audio.currentTime)
		const updateDuration = () => setDuration(audio.duration)

		audio.addEventListener("timeupdate", updateProgress)
		audio.addEventListener("loadedmetadata", updateDuration)

		return () => {
			setTimeProgress(0) // neecessary?
			audio.removeEventListener("timeupdate", updateProgress)
			audio.removeEventListener("loadedmetadata", updateDuration)
		}
	}, [audioRef, currentTrackUrl])

	return (
		<div>
			<span>{formatTime(timeProgress)}</span>
			<input
				defaultValue={0}
				max={duration}
				onChange={handleProgressChange}
				ref={progressBarRef}
				type="range"
				value={timeProgress}
			/>
			<span>{formatTime(duration)}</span>
		</div>
	)
}

function formatTime(time: number): string {
	const minutes = Math.floor(time / 60)
	const formatMinutes = minutes <= 0 ? "00" : `${minutes}`

	const seconds = Math.floor(time % 60)
	const formatSeconds = () => {
		if (seconds <= 0) {
			return "00"
		}
		return seconds < 10 ? `0${seconds}` : `${seconds}`
	}

	return `${formatMinutes}:${formatSeconds()}`
}
