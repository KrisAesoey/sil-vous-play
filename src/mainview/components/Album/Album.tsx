import type { AlbumEntry } from "../../../shared/audio"
import { usePlaybackContext } from "../../playback/playbackContext"
import {
	DataCell,
	HeaderCell,
	Table,
	TableBody,
	TableHead,
	TableRow,
} from "../Table/Table"
import { Heading } from "../typography/Heading/Heading"

import { Text } from "../typography/Text/Text"

import styles from "./Album.module.css"

type Props = {
	album: AlbumEntry
	onTrackSelect: (track: number) => void
	selectedTrack: number | undefined
}

export function Album({ album, onTrackSelect, selectedTrack }: Props) {
	const { nowPlaying } = usePlaybackContext()

	const isPlaying = (track: number) =>
		nowPlaying?.albumDir === album.dir && nowPlaying.trackNumber === track

	const isSelected = (track: number) => track === selectedTrack

	return (
		<div className={styles.album}>
			<Heading as="h1" size="md">
				{album.album.title}
			</Heading>
			<Table>
				<TableHead>
					<TableRow>
						<HeaderCell>
							<Heading as="h2" size="sm">
								Track
							</Heading>
						</HeaderCell>
						<HeaderCell>
							<Heading as="h2" size="sm">
								Title
							</Heading>
						</HeaderCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{album.album.tracks.map((track) => (
						<TableRow
							key={track.track}
							onClick={() => onTrackSelect(track.track)}
							highlight={isSelected(track.track)}
						>
							<DataCell>
								<Text
									size="md"
									variant={isPlaying(track.track) ? "highlight" : undefined}
									weight="regular"
								>
									{track.track}
								</Text>
							</DataCell>
							<DataCell>
								<Text
									size="md"
									variant={isPlaying(track.track) ? "highlight" : undefined}
									weight="regular"
								>
									{track.title}
								</Text>
							</DataCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	)
}
