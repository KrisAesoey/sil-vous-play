import { IoMusicalNotes } from "react-icons/io5"
import type { AlbumEntry } from "../../../shared/audio"
import { Button } from "../Button/Button"
import { Text } from "../typography/Text/Text"
import styles from "./AlbumList.module.css"

type Props = {
	albums: AlbumEntry[] | undefined
	onAlbumSelect: (album: AlbumEntry) => void
	covers?: Record<string, string>
}

export function AlbumList({ albums, onAlbumSelect, covers }: Props) {
	return (
		<div className={styles.list}>
			{albums?.map((albumEntry) => (
				<Button
					key={albumEntry.album.title}
					onClick={() => onAlbumSelect(albumEntry)}
					type="button"
				>
					{covers?.[albumEntry.dir] && (
						<img
							alt="cover"
							src={createCoverUrl(covers[albumEntry.dir])}
							height="32px"
							width="32px"
						/>
					)}
					{!covers?.[albumEntry.dir] && (
						<div className={styles.placeholderCover}>
							<IoMusicalNotes />
						</div>
					)}
					<Text size="md" weight="regular">
						{albumEntry.album.title}
					</Text>
				</Button>
			))}
		</div>
	)
}

function createCoverUrl(cover: string) {
	const base64Track = atob(cover)
	const trackBytes = Uint8Array.from(base64Track, (x) => x.charCodeAt(0))
	const coverBlob = new Blob([trackBytes])
	return URL.createObjectURL(coverBlob)
}
