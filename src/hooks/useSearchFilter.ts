import { useMemo } from 'react'

interface UseSearchFilterOptions<T> {
  data: T[]
  searchTerm: string
  searchFields: (keyof T)[]
  searchFunction?: (item: T, term: string) => boolean
}

export function useSearchFilter<T>({
  data,
  searchTerm,
  searchFields,
  searchFunction
}: UseSearchFilterOptions<T>): T[] {
  return useMemo(() => {
    if (!data || !searchTerm.trim()) {
      return data
    }

    const term = searchTerm.toLowerCase().trim()

    if (searchFunction) {
      return data.filter((item) => searchFunction(item, term))
    }

    return data.filter((item) => {
      return searchFields.some((field) => {
        const value = item[field]
        if (value == null) return false
        
        const stringValue = String(value).toLowerCase()
        return stringValue.includes(term)
      })
    })
  }, [data, searchTerm, searchFields, searchFunction])
}
