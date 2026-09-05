import type { Electroview } from "electrobun/view"
import { useEffect, useState } from "react"
import type { AlbumEntry } from "../shared/audio"
import type { MyRPC } from "../shared/rpc"
import styles from "./App.module.css"
import { Album } from "./components/Album/Album"
import { AlbumList } from "./components/AlbumList/AlbumList"
import { AudioPlayer } from "./components/AudioPlayer/AudioPlayer"
import { usePlaybackContext } from "./playback/playbackContext"
import { useAudioPlayer } from "./player"
import { useUserSettingsContext } from "./userSettings/userSettingsContext"

type Props = {
	rpc: ReturnType<typeof Electroview.defineRPC<MyRPC>>
}

export function App({ rpc }: Props) {
	const { userSettings, updateUserSettings, isLoaded } =
		useUserSettingsContext()

	const [albums, setAlbums] = useState<AlbumEntry[]>()

	const [viewingAlbum, setViewingAlbum] = useState<AlbumEntry>()
	const [selectedTrack, setSelectedTrack] = useState<number | undefined>()
	const { play: setNowPlaying } = usePlaybackContext()

	function handleAlbumSelect(album: AlbumEntry) {
		setViewingAlbum(album)
		setSelectedTrack(undefined) // clear selection from old album
	}

	function handleTrackSelect(trackNumber: number) {
		if (viewingAlbum && trackNumber === selectedTrack) {
			playSelectedTrack(
				viewingAlbum.dir,
				viewingAlbum?.album.tracks ?? [],
				trackNumber,
			)
		}
		setSelectedTrack(trackNumber)
	}

	useEffect(() => {
		async function loadLibrary(dir: string) {
			const library = await rpc.request.loadLibrary(dir)
			console.log("library data:", library)
			if (!library) return

			const albumEntries = await rpc.request.loadAlbums(library.albumPaths)

			if (albumEntries.length > 0) {
				setAlbums(albumEntries)
				setViewingAlbum(albumEntries[0])
			}
		}

		if (!isLoaded || !userSettings.libraryRoot) return

		loadLibrary(userSettings.libraryRoot)
	}, [rpc, isLoaded, userSettings.libraryRoot])

	async function handleLibrarySelect() {
		const result = await rpc.request.pickFolder()
		if (!result) return
		const { folder, metadata } = result
		console.log("metadata:", metadata)
		updateUserSettings({ libraryRoot: folder })
	}

	function handleTrackChange(albumDir: string, trackNumber: number) {
		setNowPlaying({ albumDir, trackNumber })
		setSelectedTrack(undefined)
	}

	const {
		currentTrackType,
		currentTrackUrl,
		playSelectedTrack,
		playPrevTrack,
		playNextTrack,
	} = useAudioPlayer({
		rpc,
		onTrackChange: handleTrackChange,
	})

	return (
		<div className={styles.container}>
			<div className={styles.content}>
				<div className={styles.library}>
					<button id="load-folder" onClick={handleLibrarySelect} type="button">
						LOAD FOLDER
					</button>
					<AlbumList albums={albums} onAlbumSelect={handleAlbumSelect} />
				</div>
				<div className={styles.display}>
					{viewingAlbum && (
						<Album
							album={viewingAlbum}
							onTrackSelect={handleTrackSelect}
							selectedTrack={selectedTrack}
						/>
					)}
				</div>
			</div>
			<AudioPlayer
				currentTrackUrl={currentTrackUrl}
				currentTrackType={currentTrackType}
				playNextTrack={playNextTrack}
				playPrevTrack={playPrevTrack}
			/>
		</div>
	)
}
