import type { Electroview } from "electrobun/view"
import { useEffect, useState } from "react"
import type { MyRPC } from "../../shared/rpc"
import {
	DEFAULT_USER_SETTINGS,
	type UserSettings,
} from "../../shared/userSettings"

type Props = {
	rpc: ReturnType<typeof Electroview.defineRPC<MyRPC>>
}

export type UseUserSettings = {
	userSettings: UserSettings
	updateUserSettings: (patch: Partial<UserSettings>) => void
	isLoaded: boolean
}

export function useUserSettings({ rpc }: Props) {
	const [userSettings, setUserSettings] = useState<UserSettings>(
		DEFAULT_USER_SETTINGS,
	)
	const [isLoaded, setIsLoaded] = useState(false)

	useEffect(() => {
		async function loadInitialUserSettings() {
			const initial = await rpc.request.loadUserSettings()
			setUserSettings(initial)
			setIsLoaded(true)
		}
		loadInitialUserSettings()
	}, [rpc])

	async function updateUserSettings(patch: Partial<UserSettings>) {
		const updated = await rpc.request.updateUserSettings(patch)
		setUserSettings(updated)
	}

	return { userSettings, updateUserSettings, isLoaded }
}
