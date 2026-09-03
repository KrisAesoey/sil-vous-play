import type { AlbumEntry } from "../../../shared/audio"
import { Button } from "../Button/Button"
import { Text } from "../typography/Text/Text"
import styles from "./AlbumList.module.css"

type Props = {
	albums: AlbumEntry[] | undefined
	onAlbumSelect: (album: AlbumEntry) => void
}

export function AlbumList({ albums, onAlbumSelect }: Props) {
	return (
		<div className={styles.list}>
			{albums?.map((albumEntry) => (
				<Button
					key={albumEntry.album.title}
					onClick={() => onAlbumSelect(albumEntry)}
					type="button"
				>
					<Text size="md" weight="regular">
						{albumEntry.album.title}
					</Text>
				</Button>
			))}
		</div>
	)
}
