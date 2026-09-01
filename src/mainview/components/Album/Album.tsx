import type { AlbumMetadata } from "../../../shared/audio"
import {
	DataCell,
	HeaderCell,
	Table,
	TableBody,
	TableHead,
	TableRow,
} from "../Table/Table"

import styles from "./Album.module.css"

type Props = {
	album: AlbumMetadata
	onTrackSelect: (track: number) => void
	selectedTrack: number | undefined
}

export function Album({ album, onTrackSelect, selectedTrack }: Props) {
	return (
		<div className={styles.album}>
			<h2>{album.title}</h2>
			<Table>
				<TableHead>
					<TableRow>
						<HeaderCell>Track</HeaderCell>
						<HeaderCell>Title</HeaderCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{album.tracks.map((track) => (
						<TableRow
							key={track.track}
							onClick={() => onTrackSelect(track.track)}
							selected={track.track === selectedTrack}
						>
							<DataCell>{track.track}</DataCell>
							<DataCell>{track.title}</DataCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	)
}
