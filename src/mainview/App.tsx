import type { Electroview } from "electrobun/view"
import { useCallback, useEffect, useState } from "react"
import type { AlbumEntry } from "../shared/audio"
import type { MyRPC } from "../shared/rpc"
import styles from "./App.module.css"
import { Album } from "./components/Album/Album"
import { AlbumList } from "./components/AlbumList/AlbumList"
import { AudioPlayer } from "./components/AudioPlayer/AudioPlayer"
import { Settings } from "./components/Settings/Settings"
import { usePlaybackContext } from "./playback/playbackContext"
import { useAudioPlayer } from "./player"
import { useUserSettingsContext } from "./userSettings/userSettingsContext"

type Props = {
	rpc: ReturnType<typeof Electroview.defineRPC<MyRPC>>
}

export function App({ rpc }: Props) {
	const { userSettings, isLoaded } = useUserSettingsContext()

	const [albums, setAlbums] = useState<AlbumEntry[]>()
	const [covers, setCovers] = useState<Record<string, string>>()

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

	const loadLibrary = useCallback(
		async (dir: string) => {
			const library = await rpc.request.loadLibrary(dir)
			if (!library) return

			const albumEntries = await rpc.request.loadAlbums(library.albumPaths)

			if (albumEntries.length > 0) {
				setAlbums(albumEntries)
				setViewingAlbum(albumEntries[0])
			}
		},
		[rpc],
	)

	const loadCovers = useCallback(
		async (albums: AlbumEntry[]) => {
			const albumPaths = albums.map((album) => album.dir)
			const coverMap = await rpc.request.loadCovers(albumPaths)
			setCovers(coverMap)
		},
		[rpc],
	)

	useEffect(() => {
		if (!albums) return
		loadCovers(albums)
	}, [albums, loadCovers])

	// biome-ignore lint/correctness/useExhaustiveDependencies: only trigger on initial load
	useEffect(() => {
		if (!isLoaded || !userSettings.libraryRoot) return

		loadLibrary(userSettings.libraryRoot)
	}, [isLoaded])

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
					<Settings loadLibrary={loadLibrary} rpc={rpc} />
					<AlbumList
						albums={albums}
						onAlbumSelect={handleAlbumSelect}
						covers={covers}
					/>
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
