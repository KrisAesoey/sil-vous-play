import type { Electroview } from "electrobun/view"
import { useCallback, useEffect, useMemo, useState } from "react"
import type { AlbumEntry, TrackFile } from "../shared/audio"
import type { MyRPC } from "../shared/rpc"
import styles from "./App.module.css"
import { Album } from "./components/Album/Album"
import { AlbumList } from "./components/AlbumList/AlbumList"
import { AudioPlayer } from "./components/AudioPlayer/AudioPlayer"
import { Settings } from "./components/Settings/Settings"
import { NowPlaying } from "./panels/NowPlaying/NowPlaying"
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

	function handleTrackChange(albumDir: string, track: TrackFile) {
		setNowPlaying({ albumDir, track })
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

	const coverUrls = useMemo(() => {
		if (!covers) return undefined
		const urls: Record<string, string> = {}
		for (const [dir, cover] of Object.entries(covers)) {
			urls[dir] = createCoverUrl(cover)
		}
		return urls
	}, [covers])

	useEffect(() => {
		return () => {
			if (coverUrls) Object.values(coverUrls).forEach(URL.revokeObjectURL)
		}
	}, [coverUrls])

	return (
		<div className={styles.container}>
			<div className={styles.content}>
				<div className={styles.library}>
					<Settings loadLibrary={loadLibrary} rpc={rpc} />
					<AlbumList
						albums={albums}
						onAlbumSelect={handleAlbumSelect}
						covers={coverUrls}
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
				<NowPlaying covers={coverUrls} />
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

function createCoverUrl(cover: string) {
	const trackBytes = Uint8Array.fromBase64(cover)
	const coverBlob = new Blob([trackBytes])
	return URL.createObjectURL(coverBlob)
}
