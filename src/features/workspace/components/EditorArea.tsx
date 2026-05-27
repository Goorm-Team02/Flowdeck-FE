import MonacoEditor from '@monaco-editor/react'
import { useAtom, useAtomValue } from 'jotai'
import { useParams } from 'react-router-dom'

import { useFile } from '../hooks/useFile'
import { openFileIdAtom } from '../stores/openFileAtom'
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

  const { data: file, isLoading, isError } = useFile(projectId, openFileId)

  const fileName = file?.name ?? '파일을 선택하세요'
  const language = file ? getLanguage(file.name) : 'plaintext'

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
          <span>{fileName}</span>
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
              key={file.id}
              height="100%"
              language={language}
              value={file.content}
              theme="vs-dark"
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
        </div>
      )}

      <TerminalPanel />
    </div>
  )
}
