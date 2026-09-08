import styles from "./SettingButton.module.css"

type Props = {
	children: React.ReactNode
	onClick: () => void
	size?: number
	type?: "button" | "reset" | "submit"
}

export function SettingButton({ children, onClick, size = 32, type }: Props) {
	return (
		<button
			className={styles.button}
			onClick={onClick}
			style={{ height: size, width: size }}
			type={type}
		>
			{children}
		</button>
	)
}
