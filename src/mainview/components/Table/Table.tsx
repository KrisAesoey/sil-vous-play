import styles from "./Table.module.css"

type TableProps = {
	children: React.ReactNode
}

export function Table({ children }: TableProps) {
	return <table>{children}</table>
}

type TableHeadProps = {
	children: React.ReactNode
}

export function TableHead({ children }: TableHeadProps) {
	return <thead>{children}</thead>
}

type TableBodyProps = {
	children: React.ReactNode
}

export function TableBody({ children }: TableBodyProps) {
	return <tbody className={styles.body}>{children}</tbody>
}

type TableRowProps = {
	children: React.ReactNode
	onClick?: () => void
	selected?: boolean
}

export function TableRow({
	children,
	onClick,
	selected = false,
}: TableRowProps) {
	return (
		<tr onClick={onClick} className={selected ? styles.selectedRow : ""}>
			{children}
		</tr>
	)
}

type HeaderCellProps = {
	children: React.ReactNode
}

export function HeaderCell({ children }: HeaderCellProps) {
	return <th>{children}</th>
}

type DataCellProps = {
	children: React.ReactNode
}
export function DataCell({ children }: DataCellProps) {
	return <td>{children}</td>
}
