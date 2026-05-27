import { useEffect, useRef } from 'react'

import MonacoEditor from '@monaco-editor/react'
import { useQueryClient } from '@tanstack/react-query'
import { useAtom, useAtomValue, useStore } from 'jotai'
import { useParams } from 'react-router-dom'

import { useFile } from '../hooks/useFile'
import { useSaveFile } from '../hooks/useSaveFile'
import { fileTreeKeys } from '../lib/queryKeys'
import {
  baseRevisionAtom,
  isDirtyAtom,
  openFileIdAtom,
  saveConflictAtom,
} from '../stores/openFileAtom'
import { historyOpenAtom } from '../stores/sidebarAtom'
import FileHistoryPanel from './FileHistoryPanel'
import TerminalPanel from './TerminalPanel'

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
  const [historyOpen, setHistoryOpen] = useAtom(historyOpenAtom)
  const openFileId = useAtomValue(openFileIdAtom)
  const [isDirty, setIsDirty] = useAtom(isDirtyAtom)
  const [saveConflict, setSaveConflict] = useAtom(saveConflictAtom)
  const jotaiStore = useStore()
  const queryClient = useQueryClient()

  const { data: file, isLoading, isError } = useFile(projectId, openFileId)
  const { mutate: save, isPending: isSaving } = useSaveFile(projectId)

  const contentRef = useRef<string>('')

  // 파일 변경(다른 파일 열기, 충돌 후 reload) 시 dirty 초기화
  useEffect(() => {
    setIsDirty(false)
  }, [file?.id, file?.editRevision, setIsDirty])

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
          onClick={() => setHistoryOpen(false)}
          className={`flex items-center gap-2 px-4 h-full text-[13px] transition-colors ${
            !historyOpen
              ? 'bg-bg-primary border-t-2 border-t-accent text-text-primary'
              : 'text-text-primary/50 hover:text-text-primary/80 hover:bg-bg-primary/50'
          }`}
        >
          {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />}
          <span>{fileName}</span>
          {isSaving && <span className="text-[11px] text-text-primary/30 ml-1">저장 중...</span>}
        </button>

        {historyOpen && (
          <button
            onClick={() => setHistoryOpen(true)}
            className="flex items-center gap-2 px-4 h-full text-[13px] transition-colors bg-bg-primary border-t-2 border-t-accent text-text-primary"
          >
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
            <span>{fileName} — 버전</span>
            <span
              onClick={(e) => {
                e.stopPropagation()
                setHistoryOpen(false)
              }}
              className="text-text-primary/30 hover:text-text-primary/70 text-sm leading-none transition-colors"
            >
              ×
            </span>
          </button>
        )}
      </div>

      {/* Main content */}
      {historyOpen ? (
        <FileHistoryPanel />
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
            <MonacoEditor
              key={editorKey}
              height="100%"
              language={language}
              defaultValue={file.content}
              theme="vs-dark"
              onChange={(value) => {
                contentRef.current = value ?? ''
                setIsDirty(true)
              }}
              onMount={(editor, monaco) => {
                contentRef.current = file.content
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
                fontSize: 13,
                lineHeight: 22,
                fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
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
          )}

          {/* 충돌 모달 */}
          {saveConflict && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <div className="bg-bg-secondary border border-border rounded-xl p-6 w-80 shadow-2xl">
                <h3 className="text-[15px] font-semibold text-text-primary mb-2">저장 충돌 발생</h3>
                <p className="text-[13px] text-text-primary/60 mb-5 leading-relaxed">
                  다른 사용자가 먼저 이 파일을 수정했습니다. 서버 최신 버전을 불러오거나 계속
                  편집할 수 있습니다.
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

      <TerminalPanel />
    </div>
  )
}
