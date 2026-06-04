import { useQuery } from '@tanstack/react-query'

import { useDebounce } from '@/shared/hooks/useDebounce'

import { searchFiles } from '../api/fileTree'
import { fileTreeKeys } from '../lib/queryKeys'

export function useFileSearch(projectId: string, keyword: string) {
  const debouncedKeyword = useDebounce(keyword, 300)

  return useQuery({
    queryKey: fileTreeKeys.search(projectId, debouncedKeyword),
    queryFn: () => searchFiles(projectId, debouncedKeyword),
    enabled: !!projectId && !!debouncedKeyword.trim(),
  })
}
