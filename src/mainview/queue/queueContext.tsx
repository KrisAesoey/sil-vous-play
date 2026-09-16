import { createContext, useContext } from "react"
import { type UseQueue, useQueue } from "./useQueue"

const QueueContext = createContext<UseQueue | null>(null)

type Props = {
	children: React.ReactNode
}

export function QueueProvider({ children }: Props) {
	const value = useQueue()

	return <QueueContext.Provider value={value}>{children}</QueueContext.Provider>
}

export function useQueueContext() {
	const ctx = useContext(QueueContext)
	if (ctx === null)
		throw new Error("useQueueContext used outside PlaybackProvider")
	return ctx
}
