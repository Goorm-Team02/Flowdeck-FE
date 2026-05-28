import { useEffect } from 'react'

import { useQuery } from '@tanstack/react-query'
import { useSetAtom } from 'jotai'

import { getFile } from '../api/files'
import { fileTreeKeys } from '../lib/queryKeys'
import { baseRevisionAtom } from '../stores/openFileAtom'

export function useFile(projectId: string, fileId: number | null) {
  const setBaseRevision = useSetAtom(baseRevisionAtom)

  const query = useQuery({
    queryKey: fileTreeKeys.detail(projectId, fileId!),
    queryFn: () => getFile(projectId, fileId!),
    enabled: !!projectId && fileId !== null,
  })

  // 파일 로드 성공 시 editRevision을 baseRevision으로 저장
  useEffect(() => {
    if (query.data) {
      setBaseRevision(query.data.editRevision)
    }
  }, [query.data, setBaseRevision])

  return query
}
