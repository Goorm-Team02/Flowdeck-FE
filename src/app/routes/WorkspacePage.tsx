import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ArrowLeft, Users, ShieldAlert, Sparkles, Code2 } from 'lucide-react'
import { projectService } from '../../features/auth/api'

interface Member {
  id: string
  email: string
  name: string
  role: 'OWNER' | 'EDITOR'
  status?: 'PENDING' | 'ACCEPTED'
}

export default function WorkspacePage() {
  const { projectId } = useParams<{ projectId: string }>()
  const [projectTitle, setProjectTitle] = useState('가상 워크스페이스')
  const [projectDesc, setProjectDesc] = useState('실시간 협업을 위한 소선 제어 채널입니다.')
  const [members, setMembers] = useState<Member[]>([])

  useEffect(() => {
    if (!projectId) return

    // Load Project details from localStorage
    const localStored = localStorage.getItem('offline_projects')
    const localList = localStored ? JSON.parse(localStored) : []
    const matched = localList.find((p: any) => p.id === projectId)
    
    if (matched) {
      setProjectTitle(matched.title)
      setProjectDesc(matched.description || '성공적으로 개설된 실시간 협업 공간입니다.')
    } else {
      if (projectId === 'proj-1') {
        setProjectTitle('Flowdeck Go 백엔드 동기화')
        setProjectDesc('Go 고성능 고가용성 실시간 IDE 동기화 및 소켓 통신 서버.')
      } else if (projectId === 'proj-2') {
        setProjectTitle('React 실시간 대시보드')
        setProjectDesc('Vite와 TS 기반의 대시보드 구조 및 자원 실시간 모니터링 웹 콘솔.')
      } else {
        setProjectTitle('협업 워크스페이스')
      }
    }

    // Load Members
    const loadMembers = async () => {
      try {
        const list = await projectService.getProjectMembers(projectId)
        setMembers(list)
      } catch (err) {
        console.error('워크스페이스 멤버 조회 실패:', err)
      }
    }
    loadMembers()
  }, [projectId])

  return (
    <div className="flex flex-col min-h-screen w-full bg-bg-primary text-text-primary font-sans items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-2xl bg-bg-secondary border border-border rounded-2xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
        
        {/* Subtle decorative background shine */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-xs text-text-muted hover:text-white transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            내 작업공간 목록으로 돌아가기
          </Link>
        </div>

        {/* Project Header card */}
        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center text-accent shrink-0">
            <Code2 size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{projectTitle}</h1>
              <span className="text-[10px] bg-accent/10 text-accent font-semibold px-2 py-0.5 rounded border border-accent/20">
                Active ID: {projectId?.slice(0, 8)}...
              </span>
            </div>
            <p className="text-xs sm:text-sm text-text-muted mt-2 leading-relaxed">{projectDesc}</p>
          </div>
        </div>

        {/* Allocation Notice Box (Simplified) */}
        <div className="p-5 rounded-xl bg-[#1e1e24] border border-border flex items-center gap-3.5 mb-8">
          <div className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-500 shrink-0">
            <ShieldAlert size={16} />
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            STOMP 인터페이스 및 가상 소켓 스트리밍 환경 구축 완료 즉시 본 연동 페이지에 반영될 예정입니다.
          </p>
        </div>

        {/* Invited Collaborators verification section */}
        <div className="border-t border-border pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-accent" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">이 프로젝트에 초대 동기화된 팀원 목록 ({members.length})</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {members.length === 0 ? (
              <p className="text-xs text-text-muted">초대된 팀원이 없습니다.</p>
            ) : (
              members.map((m) => (
                <div 
                  key={m.id} 
                  className="p-3 bg-bg-primary/45 rounded-lg border border-border/80 flex items-center justify-between hover:border-accent/40 transition-all"
                >
                  <div className="truncate pr-2">
                    <p className="text-xs font-medium text-white truncate">{m.name}</p>
                    <p className="text-[10px] text-text-muted truncate mt-0.5">{m.email}</p>
                  </div>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    m.role === 'OWNER' 
                      ? 'bg-accent/20 text-accent border border-accent/30' 
                      : m.status === 'PENDING'
                      ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      : 'bg-bg-tertiary text-text-muted border border-border'
                  }`}>
                    {m.role === 'OWNER' ? '소유자' : m.status === 'PENDING' ? '초대 대기중' : '구성원'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Back button */}
        <div className="mt-8 pt-6 border-t border-border flex justify-end">
          <Link 
            to="/"
            className="w-full sm:w-auto text-center px-6 py-2.5 rounded-lg bg-bg-tertiary hover:bg-bg-tertiary/80 text-xs sm:text-sm font-semibold text-white transition-all border border-border"
          >
            프로젝트 목록으로 돌아가기
          </Link>
        </div>

      </div>
    </div>
  )
}
