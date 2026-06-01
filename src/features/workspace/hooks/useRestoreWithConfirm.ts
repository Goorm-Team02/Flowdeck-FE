import { useState } from 'react'

import { isApiError } from '@/shared/api/errors'

import { useRestoreFileVersion } from './useRestoreFileVersion'

type RestorePhase =
  | { phase: 'confirm'; versionId: number }
  | { phase: 'toast'; ok: boolean; message: string }
  | null

function resolveRestoreError(error: unknown): string {
  if (isApiError(error)) {
    if (error.status === 403) return '복원 권한이 없습니다.'
    if (error.status === 409)
      return '다른 사용자가 먼저 파일을 수정했습니다. 잠시 후 다시 시도해주세요.'
    return error.message
  }
  return '복원 중 오류가 발생했습니다.'
}

export function useRestoreWithConfirm(projectId: string) {
  const { mutate: restore, isPending: isRestoring } = useRestoreFileVersion(projectId)
  const [restorePhase, setRestorePhase] = useState<RestorePhase>(null)

  function requestRestore(versionId: number) {
    setRestorePhase({ phase: 'confirm', versionId })
  }

  function cancelRestore() {
    setRestorePhase(null)
  }

  function confirmRestore(fileId: number, versionLabel: string) {
    if (restorePhase?.phase !== 'confirm') return
    restore(
      { fileId, versionId: restorePhase.versionId },
      {
        onSuccess: () => {
          setRestorePhase({
            phase: 'toast',
            ok: true,
            message: `${versionLabel} 버전으로 복원됐습니다.`,
          })
          setTimeout(() => setRestorePhase(null), 3000)
        },
        onError: (err) => {
          setRestorePhase({ phase: 'toast', ok: false, message: resolveRestoreError(err) })
          setTimeout(() => setRestorePhase(null), 4000)
        },
      },
    )
  }

  return { restorePhase, isRestoring, requestRestore, cancelRestore, confirmRestore }
}
