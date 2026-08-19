import { useEffect, useState } from "react"

/**
 * Custom React hook for debouncing (delayed update) of a mutable value
 * @param value the value to debounce
 * @param delay time to debounce in ms
 * @returns the original value debounced
 */
export function useDebounce<T>(value: T, delay = 200): T {
	const [debouncedValue, setDebouncedValue] = useState(value)

	useEffect(() => {
		const timeout = setTimeout(() => {
			setDebouncedValue(value)
		}, delay)

		return () => clearTimeout(timeout)
	}, [value, delay])

	return debouncedValue
}
