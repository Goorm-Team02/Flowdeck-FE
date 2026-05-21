import { useState } from 'react'

const MOCK_RESULTS = [
  {
    file: 'src/components/Editor.jsx',
    matches: [
      { line: 2, text: "import MonacoEditor from '@monaco-editor/react'" },
      { line: 5, text: '  return <MonacoEditor' },
    ],
  },
  {
    file: 'src/App.tsx',
    matches: [{ line: 8, text: "import Editor from './components/Editor'" }],
  },
  {
    file: 'package.json',
    matches: [{ line: 12, text: '    "@monaco-editor/react": "^4.6.0"' }],
  },
]

export default function SearchPanel() {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? MOCK_RESULTS.filter(
        (r) =>
          r.file.toLowerCase().includes(query.toLowerCase()) ||
          r.matches.some((m) => m.text.toLowerCase().includes(query.toLowerCase())),
      )
    : []

  return (
    <div className="w-56 flex flex-col bg-bg-secondary border-r border-border shrink-0 overflow-hidden">
      <div className="px-3 py-2 shrink-0">
        <span className="text-[11px] font-semibold text-text-primary/40 uppercase tracking-wider">
          검색
        </span>
      </div>

      <div className="px-3 pb-2 shrink-0">
        <div className="flex items-center gap-2 bg-bg-tertiary border border-border rounded px-2 py-1.5">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-text-primary/40 shrink-0"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-primary/30 outline-none"
            placeholder="검색어 입력..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-text-primary/30 hover:text-text-primary/60 transition-colors leading-none"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {query.trim() === '' ? (
          <p className="px-3 text-[12px] text-text-primary/30">검색어를 입력하세요</p>
        ) : filtered.length === 0 ? (
          <p className="px-3 text-[12px] text-text-primary/30">결과 없음</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((result) => (
              <div key={result.file}>
                <div className="flex items-center gap-1.5 px-3 py-1">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-icon-js)"
                    strokeWidth="1.5"
                    className="shrink-0"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span className="text-[12px] text-text-primary/80 truncate">{result.file}</span>
                  <span className="ml-auto text-[11px] text-text-primary/30 shrink-0">
                    {result.matches.length}
                  </span>
                </div>
                {result.matches.map((match) => (
                  <button
                    key={match.line}
                    className="w-full flex items-start gap-2 px-3 py-0.5 hover:bg-bg-hover text-left"
                  >
                    <span className="text-[11px] text-text-primary/30 shrink-0 w-5 text-right mt-px">
                      {match.line}
                    </span>
                    <span className="text-[12px] text-text-primary/60 truncate font-mono">
                      {match.text}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
