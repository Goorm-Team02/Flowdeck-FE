import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { joinProject } from '@/features/workspace/api/members'
import { tokenStorage } from '@/shared/api/client'
import { isApiError } from '@/shared/api/errors'

export default function InvitePage() {
  const { projectId = '' } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tokenStorage.getAccess()) {
      navigate(`/login?redirect=${encodeURIComponent(`/invite/${projectId}`)}`, { replace: true })
      return
    }

    joinProject(projectId)
      .then(() => navigate(`/projects/${projectId}`, { replace: true }))
      .catch((err: unknown) => {
        if (isApiError(err) && err.code === 'ALREADY_MEMBER') {
          navigate(`/projects/${projectId}`, { replace: true })
          return
        }
        setError('프로젝트 참가에 실패했습니다. 링크를 확인하거나 관리자에게 문의해 주세요.')
      })
  }, [projectId, navigate])

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-center">
          <p className="text-[14px] text-red-400">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-[13px] text-text-primary/50 hover:text-text-primary transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex items-center justify-center bg-bg-primary">
      <p className="text-[13px] text-text-primary/40">프로젝트에 참가하는 중...</p>
    </div>
  )
}
