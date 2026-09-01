import type { AlbumEntry } from "../../../shared/audio"
import styles from "./AlbumList.module.css"

type Props = {
	albums: AlbumEntry[] | undefined
	onAlbumSelect: (album: AlbumEntry) => void
}

export function AlbumList({ albums, onAlbumSelect }: Props) {
	return (
		<div className={styles.list}>
			{albums?.map((albumEntry) => (
				<button
					key={albumEntry.album.title}
					onClick={() => onAlbumSelect(albumEntry)}
					type="button"
				>
					<p>{albumEntry.album.title}</p>
				</button>
			))}
		</div>
	)
}
