'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

export interface BreadcrumbEntry {
  label: string
  href?: string
}

interface BreadcrumbContextValue {
  items: BreadcrumbEntry[]
  setItems: (items: BreadcrumbEntry[]) => void
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null)

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BreadcrumbEntry[]>([])

  return (
    <BreadcrumbContext.Provider value={{ items, setItems }}>
      {children}
    </BreadcrumbContext.Provider>
  )
}

function useBreadcrumbContext() {
  const context = useContext(BreadcrumbContext)

  if (!context) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider')
  }

  return context
}

export function useBreadcrumb() {
  return useBreadcrumbContext()
}

export function SetBreadcrumb({ items }: { items: BreadcrumbEntry[] }) {
  const { setItems } = useBreadcrumbContext()

  useEffect(() => {
    setItems(items)
    return () => setItems([])
  }, [items, setItems])

  return null
}
