import type { Electroview } from "electrobun/view"
import { useEffect, useRef, useState } from "react"
import type { TrackFile } from "../shared/audio"
import type { MyRPC } from "../shared/rpc"
import { AudioPlayer } from "./components/AudioPlayer/AudioPlayer"
import {
	DataCell,
	HeaderCell,
	Table,
	TableHead,
	TableRow,
} from "./components/Table/Table"
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
	const [album, setAlbum] = useState<Album | null>(null)
	const [currentTrack, setCurrentTrack] = useState<number | null>(null)

	const { userSettings, updateUserSettings, isLoaded } =
		useUserSettingsContext()

	useEffect(() => {
		async function readFolder(folder: string) {
			const metadata = await rpc.request.readFolder(folder)
			console.log("metadata:", metadata)
			if (!metadata) return
			const newAlbum: Album = {
				title: metadata.title,
				tracks: metadata.tracks,
			}
			setAlbum(newAlbum)
		}

		if (!isLoaded || !userSettings.libraryRoot) return

		readFolder(userSettings.libraryRoot)
	}, [rpc, isLoaded, userSettings.libraryRoot])

	async function handleClick() {
		const result = await rpc.request.pickFolder()
		if (!result) return
		const { folder, metadata } = result
		console.log("metadata:", metadata)
		updateUserSettings({ libraryRoot: folder })
		setAlbum({
			title: metadata.title,
			tracks: metadata.tracks,
		})
	}

	useEffect(() => {
		console.log(album)
	}, [album])

	const {
		currentTrackType,
		currentTrackUrl,
		playSelectedTrack,
		playPrevTrack,
		playNextTrack,
	} = useAudioPlayer({ rpc, trackList: album?.tracks ?? [] })

	async function handleTrackClick(trackIndex: number) {
		console.log("Click track number:", trackIndex)
		playSelectedTrack(trackIndex)
		setCurrentTrack(trackIndex)
	}

	return (
		<div className="container">
			<h1>Hello Electrobun! 🎉</h1>
			{/* biome-ignore lint/a11y/useMediaCaption: music playback, no dialogue/lyrics to caption */}
			<audio ref={audioRef} preload="auto" key={currentTrackUrl}>
				<source src={currentTrackUrl} type={currentTrackType} />
				Your device does not support the audio element.
			</audio>
			<button id="load-folder" onClick={handleClick} type="button">
				LOAD FOLDER
			</button>
			{album && (
				<>
					<h2>{album.title}</h2>
					<Table>
						<TableHead>
							<TableRow>
								<HeaderCell>Track</HeaderCell>
								<HeaderCell>Title</HeaderCell>
							</TableRow>
						</TableHead>
						{album.tracks.map((track) => (
							<TableRow
								key={track.track}
								onClick={() => handleTrackClick(track.track)}
								selected={track.track === currentTrack}
							>
								<DataCell>{track.track}</DataCell>
								<DataCell>{track.title}</DataCell>
							</TableRow>
						))}
					</Table>
				</>
			)}
			<AudioPlayer
				audioRef={audioRef}
				currentTrackUrl={currentTrackUrl}
				playNextTrack={playNextTrack}
				playPrevTrack={playPrevTrack}
			/>
		</div>
	)
}
