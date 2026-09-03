import clsx from "clsx"

import styles from "./Heading.module.css"

type Props = {
	as: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
	children: React.ReactNode
	size: "sm" | "md" | "lg"
}

export function Heading({ as, children, size }: Props) {
	const HeadingElement = as

	const style = clsx(styles.heading, styles[size])

	return <HeadingElement className={style}>{children}</HeadingElement>
}
