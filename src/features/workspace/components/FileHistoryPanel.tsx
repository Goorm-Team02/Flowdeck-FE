import { useState } from 'react'

interface Version {
  id: number
  author: string
  initials: string
  color: string
  title: string
  date: string
  shortDate: string
  diffAdd: number
  diffDel: number
}

const VERSIONS: Version[] = [
  {
    id: 1,
    author: '홍길동',
    initials: '홍',
    color: 'bg-red-500',
    title: '최초 생성',
    date: '2025-01-10 10:00',
    shortDate: '01-10 10:00',
    diffAdd: 5,
    diffDel: 0,
  },
  {
    id: 2,
    author: '김철수',
    initials: '김',
    color: 'bg-accent',
    title: 'Monaco 연결',
    date: '2025-01-10 11:30',
    shortDate: '01-10 11:30',
    diffAdd: 4,
    diffDel: 1,
  },
  {
    id: 3,
    author: '이영희',
    initials: '이',
    color: 'bg-orange-500',
    title: 'WebSocket 연결',
    date: '2025-01-11 09:15',
    shortDate: '01-11 09:15',
    diffAdd: 6,
    diffDel: 2,
  },
  {
    id: 4,
    author: '홍길동',
    initials: '홍',
    color: 'bg-red-500',
    title: 'Yjs CRDT 적용',
    date: '2025-01-12 14:00',
    shortDate: '01-12 14:00',
    diffAdd: 12,
    diffDel: 3,
  },
  {
    id: 5,
    author: '김철수',
    initials: '김',
    color: 'bg-accent',
    title: '버그 수정',
    date: '2025-01-13 16:45',
    shortDate: '01-13 16:45',
    diffAdd: 2,
    diffDel: 4,
  },
]

interface CodeLine {
  text: string
  isNew?: boolean
}

const VERSION_CODES: CodeLine[][] = [
  // v1
  [
    { text: "import React from 'react'" },
    { text: '' },
    { text: 'export default function Editor() {' },
    { text: '  return <div>에디터</div>' },
    { text: '}' },
  ],
  // v2
  [
    { text: "import React from 'react'" },
    { text: "import MonacoEditor from '@monaco-editor/react'", isNew: true },
    { text: '' },
    { text: 'export default function Editor() {' },
    { text: '  return <MonacoEditor', isNew: true },
    { text: '    height="100%"', isNew: true },
    { text: '    language="javascript" />', isNew: true },
    { text: '}' },
  ],
  // v3
  [
    { text: "import React, { useRef } from 'react'" },
    { text: "import MonacoEditor from '@monaco-editor/react'" },
    { text: "import { WebsocketProvider } from 'y-websocket'", isNew: true },
    { text: '' },
    { text: 'export default function Editor() {' },
    { text: '  const provider = new WebsocketProvider(url, room, ydoc)', isNew: true },
    { text: '  return <MonacoEditor' },
    { text: '    height="100%"' },
    { text: '    language="javascript" />' },
    { text: '}' },
  ],
  // v4
  [
    { text: "import React, { useRef } from 'react'" },
    { text: "import MonacoEditor from '@monaco-editor/react'" },
    { text: "import * as Y from 'yjs'", isNew: true },
    { text: "import { WebsocketProvider } from 'y-websocket'" },
    { text: '' },
    { text: 'export default function Editor() {' },
    { text: '  const ydoc = useRef(new Y.Doc()).current', isNew: true },
    { text: '  const provider = new WebsocketProvider(url, room, ydoc)' },
    { text: '  return <MonacoEditor' },
    { text: '    height="100%"' },
    { text: '    language="javascript" />' },
    { text: '}' },
  ],
  // v5
  [
    { text: "import React, { useRef, useEffect } from 'react'" },
    { text: "import MonacoEditor from '@monaco-editor/react'" },
    { text: "import * as Y from 'yjs'" },
    { text: "import { WebsocketProvider } from 'y-websocket'" },
    { text: '' },
    { text: 'export default function Editor() {' },
    { text: '  const ydoc = useRef(new Y.Doc()).current' },
    { text: '  useEffect(() => {', isNew: true },
    { text: "    const provider = new WebsocketProvider(url, room, ydoc)", isNew: true },
    { text: '    return () => provider.destroy()', isNew: true },
    { text: '  }, [])', isNew: true },
    { text: '  return <MonacoEditor' },
    { text: '    height="100%"' },
    { text: '    language="javascript" />' },
    { text: '}' },
  ],
]

export default function FileHistoryPanel() {
  const [selectedVersion, setSelectedVersion] = useState(2)
  const version = VERSIONS[selectedVersion - 1]
  const codeLines = VERSION_CODES[selectedVersion - 1]
  const total = VERSIONS.length

  return (
    <div className="flex-1 overflow-auto px-6 py-4 flex flex-col gap-4 min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-icon-js)"
            strokeWidth="1.5"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span className="text-[15px] font-semibold text-text-primary">Editor.jsx</span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-bg-tertiary text-text-primary/60 border border-border">
            {total}개 버전
          </span>
        </div>
        <span className="text-[12px] text-text-primary/40">
          v{selectedVersion} — {version.title}
        </span>
      </div>

      {/* Code preview card */}
      <div className="rounded-lg border border-border bg-bg-secondary overflow-hidden shrink-0">
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="font-mono text-[12px] leading-[1.7] py-2 overflow-x-auto">
          {codeLines.map((line, i) => (
            <div
              key={i}
              className={`flex items-start transition-colors ${line.isNew ? 'bg-green-900/20' : ''}`}
            >
              <span className="w-10 shrink-0 text-right pr-3 text-text-muted select-none">
                {i + 1}
              </span>
              <span className={`flex-1 pr-6 whitespace-pre ${line.isNew ? 'text-green-300/90' : 'text-text-primary/80'}`}>
                {line.text || ' '}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Slider */}
      <div className="shrink-0 space-y-3">
        <div className="relative flex items-center h-5">
          <div className="absolute inset-x-1.5 h-px bg-border">
            <div
              className="h-full bg-accent transition-all duration-200"
              style={{ width: `${((selectedVersion - 1) / (total - 1)) * 100}%` }}
            />
          </div>
          <div className="relative flex justify-between w-full">
            {VERSIONS.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVersion(v.id)}
                className={`rounded-full border-2 transition-all duration-200 ${
                  v.id === selectedVersion
                    ? 'w-4 h-4 bg-accent border-accent'
                    : v.id < selectedVersion
                      ? 'w-3 h-3 bg-accent border-accent'
                      : 'w-3 h-3 bg-bg-secondary border-border hover:border-text-primary/40'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-text-primary/50 hover:text-text-primary/90 hover:border-text-primary/40 transition-colors">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </button>
            <span className="text-[13px] text-text-primary/70">
              버전 {selectedVersion} / {total}
            </span>
          </div>
          <span className="text-[12px] text-text-primary/40">
            {version.author} · {version.date}
          </span>
        </div>
      </div>

      {/* Version cards */}
      <div className="flex gap-3 overflow-x-auto pb-1 shrink-0">
        {VERSIONS.map((v) => (
          <button
            key={v.id}
            onClick={() => setSelectedVersion(v.id)}
            className={`flex-none w-40 p-3 rounded-lg border text-left transition-colors ${
              v.id === selectedVersion
                ? 'border-accent/40 bg-bg-selected'
                : 'border-border bg-bg-secondary hover:bg-bg-tertiary'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <div
                className={`w-5 h-5 rounded-full ${v.color} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}
              >
                {v.initials}
              </div>
              <span className="text-[12px] text-text-primary/60 truncate">{v.author}</span>
            </div>
            <p className="text-[13px] font-semibold text-text-primary leading-tight">{v.title}</p>
            <p className="text-[11px] text-text-primary/35 mt-1">
              v{v.id} · {v.shortDate}
            </p>
          </button>
        ))}
      </div>

      {/* Diff stats */}
      <div className="text-[12px] text-text-primary/50 shrink-0">
        {selectedVersion === 1 ? (
          <span>초기 버전</span>
        ) : (
          <>
            이전 버전 대비{' '}
            <span className="text-green-400">+{version.diffAdd}줄</span>{' '}
            <span className="text-red-400">-{version.diffDel}줄</span>
          </>
        )}
      </div>
    </div>
  )
}
