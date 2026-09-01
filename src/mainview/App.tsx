import type { Electroview } from "electrobun/view"
import { useEffect, useRef, useState } from "react"
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
	const audioRef = useRef<HTMLAudioElement | null>(null)

	const { userSettings, updateUserSettings, isLoaded } =
		useUserSettingsContext()

	const {
		currentAlbum,
		setCurrentAlbum,
		currentTrackIndex,
		setCurrentTrackIndex,
	} = usePlaybackContext()

	const [albums, setAlbums] = useState<AlbumEntry[]>()

	useEffect(() => {
		async function loadLibrary(dir: string) {
			const library = await rpc.request.loadLibrary(dir)
			console.log("library data:", library)
			if (!library) return

			const albumEntries = await rpc.request.loadAlbums(library.albumPaths)

			if (albumEntries.length > 0) {
				setAlbums(albumEntries)
				setCurrentAlbum(albumEntries[0])
			}
		}

		if (!isLoaded || !userSettings.libraryRoot) return

		loadLibrary(userSettings.libraryRoot)
	}, [rpc, isLoaded, setCurrentAlbum, userSettings.libraryRoot])

	async function handleClick() {
		const result = await rpc.request.pickFolder()
		if (!result) return
		const { folder, metadata } = result
		console.log("metadata:", metadata)
		updateUserSettings({ libraryRoot: folder })
	}

	const {
		currentTrackType,
		currentTrackUrl,
		playSelectedTrack,
		playPrevTrack,
		playNextTrack,
	} = useAudioPlayer({
		rpc,
		trackList: currentAlbum?.album.tracks ?? [],
		onTrackChange: setCurrentTrackIndex,
	})

	async function handleTrackClick(trackIndex: number) {
		console.log("Click track number:", trackIndex)
		if (currentAlbum) {
			playSelectedTrack(currentAlbum.dir, trackIndex)
		}
	}

	function handleAlbumSelect(album: AlbumEntry) {
		setCurrentAlbum(album)
	}

	return (
		<div className={styles.container}>
			{/* biome-ignore lint/a11y/useMediaCaption: music playback, no dialogue/lyrics to caption */}
			<audio ref={audioRef} preload="auto" key={currentTrackUrl}>
				<source src={currentTrackUrl} type={currentTrackType} />
				Your device does not support the audio element.
			</audio>
			<div className={styles.content}>
				<div className={styles.library}>
					<button id="load-folder" onClick={handleClick} type="button">
						LOAD FOLDER
					</button>
					<AlbumList albums={albums} onAlbumSelect={handleAlbumSelect} />
				</div>
				{currentAlbum && (
					<Album
						album={currentAlbum.album}
						onTrackSelect={handleTrackClick}
						selectedTrack={currentTrackIndex}
					/>
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
