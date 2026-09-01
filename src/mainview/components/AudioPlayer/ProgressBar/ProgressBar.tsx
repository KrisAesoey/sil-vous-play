import { type RefObject, useEffect, useRef, useState } from "react"

type Props = {
	audioRef: RefObject<HTMLAudioElement | null>
	progressBarRef: RefObject<HTMLInputElement | null>
	currentTrackUrl?: string
}

export function ProgressBar({
	audioRef,
	currentTrackUrl,
	progressBarRef,
}: Props) {
	const [timeProgress, setTimeProgress] = useState(0)
	const [duration, setDuration] = useState(0)

	const isDraggingRef = useRef(false)

	const handleDrag = () => {
		const progressBar = progressBarRef.current
		if (progressBar === null) return
		isDraggingRef.current = true
		setTimeProgress(progressBar.valueAsNumber) // visual update only
	}

	const handleProgressChange = () => {
		const audio = audioRef.current
		const progressBar = progressBarRef.current
		if (audio === null || progressBar === null) return
		audio.currentTime = progressBar.valueAsNumber
		isDraggingRef.current = false
	}

	// // Update the progress and duration of a track based on audio events
	// biome-ignore lint/correctness/useExhaustiveDependencies: re-run when track changes
	useEffect(() => {
		const audio = audioRef.current
		if (audio === null) return

		const updateProgress = () => {
			// only update the audio progress if the user stops dragging
			if (!isDraggingRef.current) setTimeProgress(audio.currentTime)
		}
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
				onChange={handleDrag}
				onPointerUp={handleProgressChange}
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
