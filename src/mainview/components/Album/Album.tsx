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

	const tracks = album.album.tracks.toSorted(
		(t1, t2) => t1.trackNumber - t2.trackNumber,
	)

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
					{tracks.map((track) => (
						<TableRow
							key={`${track.trackNumber}-${track.file}`}
							onClick={() => onTrackSelect(track.trackNumber)}
							highlight={isSelected(track.trackNumber)}
						>
							<DataCell>
								<Text
									size="md"
									variant={
										isPlaying(track.trackNumber) ? "highlight" : undefined
									}
									weight="regular"
								>
									{track.trackNumber}
								</Text>
							</DataCell>
							<DataCell>
								<Text
									size="md"
									variant={
										isPlaying(track.trackNumber) ? "highlight" : undefined
									}
									weight="regular"
								>
									{track.title}
								</Text>
							</DataCell>
							<DataCell>
								<Text size="md" weight="regular">
									{formatTime(track.duration)}
								</Text>
							</DataCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	)
}

function formatTime(time: number): string {
	const minutes = Math.floor(time / 60)
	const formatMinutes = minutes <= 0 ? "00" : `${minutes}`

	const seconds = Math.floor(time % 60)
	const formatSeconds = () => {
		if (seconds <= 0) {
			return "00"
		}
		return seconds < 10 ? `0${seconds}` : `${seconds}`
	}

	return `${formatMinutes}:${formatSeconds()}`
}
