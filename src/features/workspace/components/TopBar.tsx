import { useNavigate } from 'react-router-dom'

import { useAtom, useAtomValue, useSetAtom } from 'jotai'

import { avatarColor } from '../lib/avatarColor'
import { memberModalOpenAtom } from '../stores/memberModalAtom'
import { editorContentAtom, openFileNameAtom } from '../stores/openFileAtom'
import { presenceAtom } from '../stores/presenceAtom'
import { projectTitleAtom } from '../stores/sidebarAtom'
import { isRunningAtom, runCodePayloadAtom, stopTriggerAtom } from '../stores/terminalAtom'

const PISTON_LANGS: Record<string, string> = {
  py: 'python',
  js: 'javascript',
  ts: 'typescript',
  java: 'java',
  cpp: 'c++',
  c: 'c',
  go: 'go',
  rs: 'rust',
  sh: 'bash',
  rb: 'ruby',
  php: 'php',
}

const MAX_AVATARS = 3

export default function TopBar() {
  const navigate = useNavigate()
  const [isRunning] = useAtom(isRunningAtom)
  const setStopTrigger = useSetAtom(stopTriggerAtom)
  const setRunCodePayload = useSetAtom(runCodePayloadAtom)
  const setMemberModalOpen = useSetAtom(memberModalOpenAtom)
  const { count, members } = useAtomValue(presenceAtom)
  const editorContent = useAtomValue(editorContentAtom)
  const openFileName = useAtomValue(openFileNameAtom)
  const projectTitle = useAtomValue(projectTitleAtom)

  const handleRunClick = () => {
    if (isRunning) {
      setStopTrigger((prev) => prev + 1)
      return
    }
    const ext = openFileName.split('.').pop()?.toLowerCase() ?? ''
    const language = PISTON_LANGS[ext] ?? ''
    setRunCodePayload({ code: editorContent, language, filename: openFileName })
  }

  const visibleMembers = members.slice(0, MAX_AVATARS)
  const overflow = count - visibleMembers.length

  return (
    <header className="h-10 flex items-center justify-between px-3 bg-bg-secondary border-b border-border shrink-0">
      {/* Left */}
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={() => navigate('/')}
          className="text-text-primary/50 hover:text-text-primary transition-colors cursor-pointer"
        >
          프로젝트 목록
        </button>
        <span className="text-text-primary/30">/</span>
        <span className="text-text-primary font-medium">{projectTitle || '프로젝트'}</span>
        <span className="px-1.5 py-0.5 text-xs rounded bg-bg-tertiary text-text-primary/70 border border-border">
          main
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* Avatar stack + 인원 수 */}
        <div className="flex items-center gap-2 mr-2">
          {count > 0 ? (
            <>
              <div className="flex -space-x-1.5">
                {visibleMembers.map((m, i) => (
                  <div
                    key={m.userId}
                    title={m.userName}
                    className={`w-7 h-7 rounded-full ${avatarColor(m.userId)} flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-bg-secondary`}
                    style={{ zIndex: MAX_AVATARS - i }}
                  >
                    {m.userName.slice(0, 2)}
                  </div>
                ))}
                {overflow > 0 && (
                  <div className="w-7 h-7 rounded-full bg-bg-tertiary border border-border flex items-center justify-center text-text-primary/60 text-[10px] font-bold ring-2 ring-bg-secondary">
                    +{overflow}
                  </div>
                )}
              </div>
              <span className="text-sm text-text-primary/50">{count}명 접속 중</span>
            </>
          ) : (
            <span className="text-sm text-text-primary/30">접속자 없음</span>
          )}
        </div>

        {/* 멤버 */}
        <button
          onClick={() => setMemberModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-sm text-text-primary/60 hover:text-text-primary hover:bg-bg-tertiary rounded transition-colors"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          멤버
        </button>

        {/* 실행 / 정지 */}
        <button
          onClick={handleRunClick}
          className={`flex items-center gap-1.5 px-3 py-1 ml-1 text-sm text-white rounded transition-colors font-medium ${
            isRunning ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'
          }`}
        >
          {isRunning ? (
            <>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="4" width="16" height="16" rx="1" />
              </svg>
              정지
            </>
          ) : (
            <>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              실행
            </>
          )}
        </button>
      </div>
    </header>
  )
}
