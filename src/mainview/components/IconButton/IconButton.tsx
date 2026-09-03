import clsx from "clsx"
import styles from "./IconButton.module.css"

type Props = {
	children: React.ReactNode
	onClick: () => void
	variant: "primary" | "ghost"
	size?: number
	type?: "button" | "reset" | "submit"
}

export function IconButton({
	children,
	onClick,
	variant,
	size = 32,
	type = "button",
}: Props) {
	const style = clsx(styles.button, styles[variant])

	return (
		<button
			className={style}
			onClick={onClick}
			style={{ height: size, width: size }}
			type={type}
		>
			{children}
		</button>
	)
}
