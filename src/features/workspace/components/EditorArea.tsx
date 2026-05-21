import { useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import MonacoEditor from '@monaco-editor/react'
import { historyOpenAtom } from '../stores/sidebarAtom'
import FileHistoryPanel from './FileHistoryPanel'

const INITIAL_CODE = `import React, { useEffect, useRef } from 'react'
import MonacoEditor from '@monaco-editor/react'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

export default function Editor() {
  const ydoc = useRef(new Y.Doc()).current
  const provider = new WebsocketProvider(url, room, ydoc)
  return <MonacoEditor language="javascript" />
}`

export default function EditorArea() {
  const [historyOpen, setHistoryOpen] = useAtom(historyOpenAtom)
  const [activeTab, setActiveTab] = useState<'code' | 'history'>('code')

  useEffect(() => {
    if (historyOpen) setActiveTab('history')
  }, [historyOpen])

  const closeHistory = () => {
    setHistoryOpen(false)
    setActiveTab('code')
  }

  return (
    <div className="flex-1 flex flex-col bg-bg-primary overflow-hidden min-w-0">
      {/* Tab bar */}
      <div className="flex items-end bg-bg-secondary border-b border-border shrink-0 h-9">
        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-2 px-4 h-full text-[13px] transition-colors ${
            activeTab === 'code'
              ? 'bg-bg-primary border-t-2 border-t-accent text-text-primary'
              : 'text-text-primary/50 hover:text-text-primary/80 hover:bg-bg-primary/50'
          }`}
        >
          <span>Editor.jsx</span>
          <span className="text-text-primary/30 hover:text-text-primary/70 text-sm leading-none transition-colors">
            ×
          </span>
        </button>

        {historyOpen && (
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 h-full text-[13px] transition-colors ${
              activeTab === 'history'
                ? 'bg-bg-primary border-t-2 border-t-accent text-text-primary'
                : 'text-text-primary/50 hover:text-text-primary/80 hover:bg-bg-primary/50'
            }`}
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
            <span>Editor.jsx — 버전</span>
            <span
              onClick={(e) => {
                e.stopPropagation()
                closeHistory()
              }}
              className="text-text-primary/30 hover:text-text-primary/70 text-sm leading-none transition-colors"
            >
              ×
            </span>
          </button>
        )}
      </div>

      {/* Main content */}
      {activeTab === 'code' ? (
        <div className="flex-1 overflow-hidden">
          <MonacoEditor
            height="100%"
            defaultLanguage="javascript"
            defaultValue={INITIAL_CODE}
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
        </div>
      ) : (
        <FileHistoryPanel />
      )}

      {/* Terminal panel */}
      <div className="h-44 flex flex-col border-t border-border bg-bg-secondary shrink-0">
        <div className="flex items-center justify-between px-3 h-8 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold text-text-primary/40 uppercase tracking-wider">
              터미널
            </span>
            <span className="text-[12px] text-text-primary/70 bg-bg-tertiary px-2 py-0.5 rounded">
              npm run dev
            </span>
          </div>
          <button className="text-text-primary/30 hover:text-text-primary/60 transition-colors text-sm leading-none">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-auto p-3 font-mono text-[12px] bg-bg-primary">
          <div className="space-y-0.5">
            <div>
              <span className="text-terminal-green">react-dashboard</span>
              <span className="text-text-primary"> npm run dev</span>
            </div>
            <div className="text-terminal-blue">&gt; vite</div>
            <div className="h-2" />
            <div className="text-terminal-green">VITE v6.3.5 ready in 412 ms</div>
            <div className="h-1" />
            <div>
              <span className="text-terminal-blue">➜</span>
              <span className="text-text-primary"> Local: </span>
              <span className="text-terminal-blue underline">http://localhost:5173/</span>
            </div>
            <div className="mt-2 flex items-center">
              <span className="text-terminal-green">react-dashboard</span>
              <span className="text-text-primary"> |</span>
              <span className="ml-0.5 text-text-primary animate-pulse">▋</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
