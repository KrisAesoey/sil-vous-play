import type { AlbumMetadata } from "../../../shared/audio"
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
	album: AlbumMetadata
	onTrackSelect: (track: number) => void
	selectedTrack: number | undefined
}

export function Album({ album, onTrackSelect, selectedTrack }: Props) {
	const { currentAlbum } = usePlaybackContext()

	function isSelectedTrack(track: number): boolean {
		if (!currentAlbum) return false
		return currentAlbum.album === album && track === selectedTrack
	}

	return (
		<div className={styles.album}>
			<Heading as="h1" size="md">
				{album.title}
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
					{album.tracks.map((track) => (
						<TableRow
							key={track.track}
							onClick={() => onTrackSelect(track.track)}
						>
							<DataCell>
								<Text
									size="md"
									variant={
										isSelectedTrack(track.track) ? "highlight" : undefined
									}
									weight="regular"
								>
									{track.track}
								</Text>
							</DataCell>
							<DataCell>
								<Text
									size="md"
									variant={
										isSelectedTrack(track.track) ? "highlight" : undefined
									}
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
