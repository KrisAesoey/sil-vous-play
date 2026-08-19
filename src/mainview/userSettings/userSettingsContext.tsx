import type { Electroview } from "electrobun/view"
import { createContext, useContext, useMemo } from "react"
import type { MyRPC } from "../../shared/rpc"
import { type UseUserSettings, useUserSettings } from "./useUserSettings"

const UserSettingsContext = createContext<UseUserSettings | null>(null)

type Props = {
	children: React.ReactNode
	rpc: ReturnType<typeof Electroview.defineRPC<MyRPC>>
}

export function UserSettingsProvider({ rpc, children }: Props) {
	const { userSettings, updateUserSettings, isLoaded } = useUserSettings({
		rpc,
	})

	// Every time useUserSettings run the values because a fresh object
	// so we memo them to only change if any of the pieces actually changes
	const value = useMemo(
		() => ({ userSettings, updateUserSettings, isLoaded }),
		[userSettings, updateUserSettings, isLoaded],
	)

	return (
		<UserSettingsContext.Provider value={value}>
			{children}
		</UserSettingsContext.Provider>
	)
}

export function useUserSettingsContext() {
	const ctx = useContext(UserSettingsContext)
	if (ctx === null)
		throw new Error("useUserSettingsContext used outside UserSettingsProvider")
	return ctx
}
