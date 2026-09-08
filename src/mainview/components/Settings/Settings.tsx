import type { Electroview } from "electrobun/view"
import { IoFolderOpenOutline, IoRefreshOutline } from "react-icons/io5"
import type { MyRPC } from "../../../shared/rpc"
import { useUserSettingsContext } from "../../userSettings/userSettingsContext"
import { SettingButton } from "../SettingButton/SettingButton"
import styles from "./Settings.module.css"

type Props = {
	loadLibrary: (dir: string) => Promise<void>
	rpc: ReturnType<typeof Electroview.defineRPC<MyRPC>>
}

export function Settings({ loadLibrary, rpc }: Props) {
	const { userSettings, updateUserSettings } = useUserSettingsContext()

	async function handleLibrarySelect() {
		const result = await rpc.request.selectLibrary()
		if (!result) return
		const { dir } = result

		updateUserSettings({ libraryRoot: dir })
		loadLibrary(dir)
	}

	async function handleLibraryRefresh() {
		if (!userSettings.libraryRoot) return
		await rpc.request.refreshLibrary(userSettings.libraryRoot)
		loadLibrary(userSettings.libraryRoot)
	}

	return (
		<div className={styles.settings}>
			<SettingButton onClick={handleLibrarySelect}>
				<IoFolderOpenOutline className={styles.icon} size={32} />
			</SettingButton>
			<SettingButton onClick={handleLibraryRefresh}>
				<IoRefreshOutline className={styles.icon} size={32} />
			</SettingButton>
		</div>
	)
}
