import styles from "./Button.module.css"

type Props = {
	children: React.ReactNode
	onClick: () => void
	type: "button" | "reset" | "submit"
}

export function Button({ children, onClick, type }: Props) {
	return (
		<button className={styles.button} onClick={onClick} type={type}>
			{children}
		</button>
	)
}
