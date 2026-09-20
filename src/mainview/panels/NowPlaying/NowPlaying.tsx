import { IoMusicalNotes } from "react-icons/io5"
import { Heading } from "../../components/typography/Heading/Heading"
import { Text } from "../../components/typography/Text/Text"
import { usePlaybackContext } from "../../playback/playbackContext"
import { useQueueContext } from "../../queue/queueContext"

import styles from "./NowPlaying.module.css"

type Props = {
	covers: Record<string, string> | undefined
}

export function NowPlaying({ covers }: Props) {
	const { nowPlaying } = usePlaybackContext()
	const { queue } = useQueueContext()

	const cover = nowPlaying ? covers?.[nowPlaying.albumDir] : undefined

	return (
		<div className={styles.container}>
			<div className={styles.nowPlaying}>
				{cover && <img alt="cover" src={cover} height="240px" width="240px" />}
				{!cover && (
					<div className={styles.placeholderCover}>
						<IoMusicalNotes />
					</div>
				)}
				<Heading as="h2" size="md">
					{nowPlaying?.track.title}
				</Heading>
			</div>
			<div className={styles.queue}>
				<Heading as="h2" size="sm">
					Queue
				</Heading>
				{queue.length === 0 && <Text size="md">...</Text>}
				{queue.length > 0 &&
					queue.map((queuedTrack) => {
						return (
							<Text key={queuedTrack.dir + queuedTrack.track.file} size="md">
								{queuedTrack.track.title}
							</Text>
						)
					})}
			</div>
		</div>
	)
}
