import type { Electroview } from "electrobun/view"
import { useEffect, useRef, useState } from "react"
import type { TrackFile } from "../shared/audio"
import type { MyRPC } from "../shared/rpc"
import { AudioPlayer } from "./components/AudioPlayer/AudioPlayer"
import { useAudioPlayer } from "./player"

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

	async function handleClick() {
		const metadata = await rpc.request.pickFolder()
		console.log("metadata:", metadata)
		if (!metadata) return
		const newAlbum: Album = {
			title: metadata.title,
			tracks: metadata.tracks,
		}
		setAlbum(newAlbum)
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
					{album.tracks.map((track) => (
						<button
							key={track.track}
							onClick={() => handleTrackClick(track.track)}
							type="button"
						>
							{track.title}
						</button>
					))}
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
