export async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url)

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message ?? 'Failed to load data')
  }

  return response.json() as Promise<T>
}
