import { useEffect, useState } from 'react'

export { cn } from 'cn'

export const useDebounce = <T>(value: T, delay: number = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Clean up the timeout if value changes before the delay expires
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}
