import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import MonacoEditor from '@monaco-editor/react'
import { useQueryClient } from '@tanstack/react-query'
import { useAtom, useAtomValue, useSetAtom, useStore } from 'jotai'

import { currentUserAtom } from '@/features/auth/stores/currentUserAtom'

import { registerMonacoThemes } from '@/shared/lib/monacoThemes'
import { MONACO_THEME_MAP, editorSettingsAtom } from '@/shared/stores/editorSettingsAtom'

import { useCreateFileVersion } from '../hooks/useCreateFileVersion'
import { useCurrentMemberRole } from '../hooks/useCurrentMemberRole'
import { useFile } from '../hooks/useFile'
import { useFileEditingPresence } from '../hooks/useFileEditingPresence'
import { useSaveFile } from '../hooks/useSaveFile'
import { fileTreeKeys } from '../lib/queryKeys'
import { fileEditorsAtom } from '../stores/fileEditorAtom'
import {
  baseRevisionAtom,
  editorContentAtom,
  isDirtyAtom,
  openFileIdAtom,
  openFileNameAtom,
  saveConflictAtom,
} from '../stores/openFileAtom'
import { timelineOpenAtom } from '../stores/sidebarAtom'
import TerminalPanel from './TerminalPanel'
import VersionTimelineSlide from './VersionTimelineSlide'

function getLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'ts':
    case 'tsx':
      return 'typescript'
    case 'js':
    case 'jsx':
      return 'javascript'
    case 'json':
      return 'json'
    case 'md':
      return 'markdown'
    case 'html':
      return 'html'
    case 'css':
      return 'css'
    case 'py':
      return 'python'
    case 'java':
      return 'java'
    default:
      return 'plaintext'
  }
}

export default function EditorArea() {
  const { projectId = '' } = useParams<{ projectId: string }>()
  const [timelineOpen, setTimelineOpen] = useAtom(timelineOpenAtom)
  const openFileId = useAtomValue(openFileIdAtom)
  const [isDirty, setIsDirty] = useAtom(isDirtyAtom)
  const [saveConflict, setSaveConflict] = useAtom(saveConflictAtom)
  const jotaiStore = useStore()
  const queryClient = useQueryClient()
  const currentUser = useAtomValue(currentUserAtom)
  const memberRole = useCurrentMemberRole(projectId)
  const editorSettings = useAtomValue(editorSettingsAtom)
  const setEditorContent = useSetAtom(editorContentAtom)
  const setOpenFileName = useSetAtom(openFileNameAtom)
  const monacoTheme = MONACO_THEME_MAP[editorSettings.monacoTheme] ?? editorSettings.monacoTheme
  const isViewer = memberRole === 'VIEWER'
  const fileEditors = useAtomValue(fileEditorsAtom)

  useFileEditingPresence(projectId, openFileId, isViewer)

  const activeEditor = openFileId ? fileEditors.get(openFileId) : undefined
  // numericId가 확인된 경우에만 락 적용 (-1이면 미확인 → 락 미적용)
  const isLockedByOther =
    !!activeEditor &&
    currentUser !== null &&
    currentUser.numericId !== -1 &&
    activeEditor.actorId !== currentUser.numericId
  const isReadOnly = isViewer || isLockedByOther

  const { data: file, isLoading, isError } = useFile(projectId, openFileId)
  const { mutate: save, isPending: isSaving } = useSaveFile(projectId)
  const {
    mutate: createVersion,
    isPending: isCreatingVersion,
    isSuccess: versionSaved,
    reset: resetVersionSaved,
  } = useCreateFileVersion(projectId)

  useEffect(() => {
    if (!versionSaved) return
    const id = setTimeout(resetVersionSaved, 2000)
    return () => clearTimeout(id)
  }, [versionSaved, resetVersionSaved])

  const [versionMessageOpen, setVersionMessageOpen] = useState(false)
  const [versionMessage, setVersionMessage] = useState('')

  const handleCreateVersion = () => {
    if (!openFileId) return
    setVersionMessage('')
    setVersionMessageOpen(true)
  }

  const handleVersionMessageConfirm = () => {
    if (!openFileId || !versionMessage.trim()) return
    createVersion({ fileId: openFileId, changeMessage: versionMessage.trim() })
    setVersionMessageOpen(false)
    setVersionMessage('')
  }

  const contentRef = useRef<string>('')

  // 파일 변경(다른 파일 열기, 충돌 후 reload) 시 dirty 초기화 + 파일명 동기화
  useEffect(() => {
    setIsDirty(false)
    setOpenFileName(file?.name ?? '')
  }, [file?.id, file?.editRevision, setIsDirty, setOpenFileName, file?.name])

  const handleConflictReload = () => {
    if (!openFileId) return
    queryClient.invalidateQueries({ queryKey: fileTreeKeys.detail(projectId, openFileId) })
    setSaveConflict(false)
    setIsDirty(false)
  }

  const fileName = file?.name ?? '파일을 선택하세요'
  const language = file ? getLanguage(file.name) : 'plaintext'
  // editRevision 변경 시(충돌 후 reload) Monaco를 remount해 최신 내용으로 재설정
  const editorKey = file ? `${file.id}-${file.editRevision}` : 'empty'

  return (
    <div className="flex-1 flex flex-col bg-bg-primary overflow-hidden min-w-0">
      {/* Tab bar */}
      <div className="flex items-end bg-bg-secondary border-b border-border shrink-0 h-9">
        <button
          onClick={() => setTimelineOpen(false)}
          className={`flex items-center gap-2 px-4 h-full text-[13px] transition-colors ${
            !timelineOpen
              ? 'bg-bg-primary border-t-2 border-t-accent text-text-primary'
              : 'text-text-primary/50 hover:text-text-primary/80 hover:bg-bg-primary/50'
          }`}
        >
          {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />}
          <span>{fileName}</span>
          {isSaving && <span className="text-[11px] text-text-primary/30 ml-1">저장 중...</span>}
        </button>

        {timelineOpen && (
          <div className="flex items-center gap-2 px-4 h-full text-[13px] bg-bg-primary border-t-2 border-t-accent text-text-primary">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-text-primary/60"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{fileName} — 타임라인</span>
            <span
              onClick={() => setTimelineOpen(false)}
              className="text-text-primary/30 hover:text-text-primary/70 text-sm leading-none transition-colors cursor-pointer"
            >
              ×
            </span>
          </div>
        )}

        {/* 버전 저장 버튼 (VIEWER 제외, 파일 열린 경우만) */}
        {file && !isViewer && (
          <div className="ml-auto flex items-center pr-3 h-full">
            <button
              onClick={handleCreateVersion}
              disabled={isCreatingVersion}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[12px] rounded border border-border/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:border-border hover:bg-bg-tertiary text-text-primary/50 hover:text-text-primary/80"
            >
              {isCreatingVersion ? (
                <span>저장 중...</span>
              ) : versionSaved ? (
                <span className="text-green-400">버전 저장됨 ✓</span>
              ) : (
                <>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>버전 저장</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Main content */}
      {timelineOpen ? (
        <VersionTimelineSlide />
      ) : (
        <div className="flex-1 overflow-hidden relative">
          {!openFileId && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-[13px] text-text-primary/25">파일을 선택하면 내용이 표시됩니다</p>
            </div>
          )}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-[13px] text-text-primary/30">불러오는 중...</p>
            </div>
          )}
          {isError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-[13px] text-red-400/70">파일을 불러올 수 없습니다.</p>
            </div>
          )}
          {file && (
            <>
              {isLockedByOther && (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 shrink-0 text-[12px] text-amber-400/90">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="shrink-0"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>
                    <span className="font-medium">{activeEditor?.actorName}</span>님이 편집
                    중입니다. 읽기 전용 모드로 열립니다.
                  </span>
                </div>
              )}
              <MonacoEditor
                key={editorKey}
                height="100%"
                language={language}
                defaultValue={file.content}
                theme={monacoTheme}
                onChange={(value) => {
                  if (isReadOnly) return
                  contentRef.current = value ?? ''
                  setEditorContent(value ?? '')
                  setIsDirty(true)
                }}
                onMount={(editor, monaco) => {
                  registerMonacoThemes(monaco)
                  monaco.editor.setTheme(monacoTheme)
                  contentRef.current = file.content
                  setEditorContent(file.content)
                  if (isReadOnly) return
                  // Cmd/Ctrl+S — useStore로 최신 atom 값을 항상 읽어서 stale closure 방지
                  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
                    const fileId = jotaiStore.get(openFileIdAtom)
                    const rev = jotaiStore.get(baseRevisionAtom)
                    const dirty = jotaiStore.get(isDirtyAtom)
                    if (!fileId || rev === null || !dirty) return
                    save({ fileId, content: contentRef.current, baseRevision: rev })
                  })
                }}
                options={{
                  readOnly: isReadOnly,
                  fontSize: editorSettings.fontSize,
                  lineHeight: Math.round(editorSettings.fontSize * 1.7),
                  fontFamily: "'JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  tabSize: 2,
                  wordWrap: 'on',
                  renderLineHighlight: 'line',
                  overviewRulerLanes: 0,
                  hideCursorInOverviewRuler: true,
                  overviewRulerBorder: false,
                  padding: { top: 12, bottom: 12 },
                }}
              />
            </>
          )}

          {/* 충돌 모달 */}
          {saveConflict && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <div className="bg-bg-secondary border border-border rounded-xl p-6 w-80 shadow-2xl">
                <h3 className="text-[15px] font-semibold text-text-primary mb-2">저장 충돌 발생</h3>
                <p className="text-[13px] text-text-primary/60 mb-5 leading-relaxed">
                  다른 사용자가 먼저 이 파일을 수정했습니다. 서버 최신 버전을 불러오거나 계속 편집할
                  수 있습니다.
                </p>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setSaveConflict(false)}
                    className="px-4 py-1.5 text-[13px] text-text-primary/60 hover:text-text-primary transition-colors"
                  >
                    계속 편집
                  </button>
                  <button
                    onClick={handleConflictReload}
                    className="px-4 py-1.5 text-[13px] bg-accent text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    최신 버전 불러오기
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 버전 메시지 입력 모달 */}
      {versionMessageOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-secondary border border-border rounded-xl p-6 w-80 shadow-2xl">
            <h3 className="text-[15px] font-semibold text-text-primary mb-2">버전 저장</h3>
            <p className="text-[13px] text-text-primary/60 mb-3">변경 메시지를 입력하세요.</p>
            <input
              autoFocus
              value={versionMessage}
              onChange={(e) => setVersionMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && versionMessage.trim()) handleVersionMessageConfirm()
                if (e.key === 'Escape') setVersionMessageOpen(false)
              }}
              placeholder="예: 기능 추가, 버그 수정..."
              className="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-[13px] text-text-primary placeholder:text-text-primary/30 outline-none focus:border-accent/60 mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setVersionMessageOpen(false)}
                className="px-4 py-1.5 text-[13px] text-text-primary/60 hover:text-text-primary transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleVersionMessageConfirm}
                disabled={!versionMessage.trim()}
                className="px-4 py-1.5 text-[13px] bg-accent text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      <TerminalPanel />
    </div>
  )
}
