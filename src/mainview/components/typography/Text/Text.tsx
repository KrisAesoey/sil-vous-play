import clsx from "clsx"
import type React from "react"
import styles from "./Text.module.css"

type Props = {
	children: React.ReactNode
	size: "sm" | "md" | "lg"
	as?: "p" | "span"
	variant?: "highlight"
	weight?: "regular" | "bold"
}

export function Text({
	children,
	size,
	as = "p",
	variant,
	weight = "regular",
}: Props) {
	const TextElement = as

	const style = clsx(
		styles.text,
		styles[size],
		styles[weight],
		variant ? styles[variant] : "",
	)

	return <TextElement className={style}>{children}</TextElement>
}
