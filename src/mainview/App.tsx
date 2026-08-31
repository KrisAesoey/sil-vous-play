import type { Electroview } from "electrobun/view"
import { useEffect, useRef } from "react"
import type { TrackFile } from "../shared/audio"
import type { MyRPC } from "../shared/rpc"
import styles from "./App.module.css"
import { AudioPlayer } from "./components/AudioPlayer/AudioPlayer"
import {
	DataCell,
	HeaderCell,
	Table,
	TableBody,
	TableHead,
	TableRow,
} from "./components/Table/Table"
import { usePlaybackContext } from "./playback/playbackContext"
import { useAudioPlayer } from "./player"
import { useUserSettingsContext } from "./userSettings/userSettingsContext"

type Album = {
	title: string
	tracks: TrackFile[]
	artist?: string
	artwork?: string
	year?: string
}

type Props = {
	rpc: ReturnType<typeof Electroview.defineRPC<MyRPC>>
}

export function App({ rpc }: Props) {
	const audioRef = useRef<HTMLAudioElement | null>(null)

	const { userSettings, updateUserSettings, isLoaded } =
		useUserSettingsContext()

	const {
		currentAlbum,
		setCurrentAlbum,
		currentTrackIndex,
		setCurrentTrackIndex,
	} = usePlaybackContext()

	useEffect(() => {
		async function readFolder(folder: string) {
			const metadata = await rpc.request.readFolder(folder)
			console.log("metadata:", metadata)
			if (!metadata) return
			const newAlbum: Album = {
				title: metadata.title,
				tracks: metadata.tracks,
			}
			setCurrentAlbum(newAlbum)
		}

		if (!isLoaded || !userSettings.libraryRoot) return

		readFolder(userSettings.libraryRoot)
	}, [rpc, isLoaded, setCurrentAlbum, userSettings.libraryRoot])

	async function handleClick() {
		const result = await rpc.request.pickFolder()
		if (!result) return
		const { folder, metadata } = result
		console.log("metadata:", metadata)
		updateUserSettings({ libraryRoot: folder })
		setCurrentAlbum({
			title: metadata.title,
			tracks: metadata.tracks,
		})
	}

	const {
		currentTrackType,
		currentTrackUrl,
		playSelectedTrack,
		playPrevTrack,
		playNextTrack,
	} = useAudioPlayer({
		rpc,
		trackList: currentAlbum?.tracks ?? [],
		onTrackChange: setCurrentTrackIndex,
	})

	async function handleTrackClick(trackIndex: number) {
		console.log("Click track number:", trackIndex)
		playSelectedTrack(trackIndex)
	}

	return (
		<div className={styles.container}>
			{/* biome-ignore lint/a11y/useMediaCaption: music playback, no dialogue/lyrics to caption */}
			<audio ref={audioRef} preload="auto" key={currentTrackUrl}>
				<source src={currentTrackUrl} type={currentTrackType} />
				Your device does not support the audio element.
			</audio>
			<div className={styles.content}>
				<button id="load-folder" onClick={handleClick} type="button">
					LOAD FOLDER
				</button>
				{currentAlbum && (
					<>
						<h2>{currentAlbum.title}</h2>
						<Table>
							<TableHead>
								<TableRow>
									<HeaderCell>Track</HeaderCell>
									<HeaderCell>Title</HeaderCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{currentAlbum.tracks.map((track) => (
									<TableRow
										key={track.track}
										onClick={() => handleTrackClick(track.track)}
										selected={track.track === currentTrackIndex}
									>
										<DataCell>{track.track}</DataCell>
										<DataCell>{track.title}</DataCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</>
				)}
			</div>
			<AudioPlayer
				audioRef={audioRef}
				currentTrackUrl={currentTrackUrl}
				playNextTrack={playNextTrack}
				playPrevTrack={playPrevTrack}
			/>
		</div>
	)
}
