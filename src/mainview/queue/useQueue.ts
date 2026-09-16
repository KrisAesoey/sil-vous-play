import { useState } from "react"
import type { TrackFile } from "../../shared/audio"

export type QueueElement = {
	dir: string
	track: TrackFile
}

export type UseQueue = {
	queue: QueueElement[]
	clear: () => void
	dequeue: () => void
	enqueue: (track: QueueElement) => void
	head: QueueElement | undefined
	removeAt: (index: number) => void
}

export function useQueue(): UseQueue {
	const [queue, setQueue] = useState<QueueElement[]>([])

	const clear = () => {
		setQueue([])
	}

	const dequeue = () => {
		setQueue((prevQueue) => prevQueue.slice(1))
	}

	const enqueue = (track: QueueElement) => {
		setQueue((prevQueue) => [...prevQueue, track])
	}

	const head = queue[0]

	const removeAt = (index: number) => {
		setQueue((prevQueue) => prevQueue.filter((_, i) => i !== index))
	}

	return {
		queue,
		clear,
		dequeue,
		enqueue,
		head,
		removeAt,
	}
}
