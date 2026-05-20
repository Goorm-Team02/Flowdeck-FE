type Token = { text: string; color: string }

const T = {
  keyword: 'var(--color-token-keyword)',
  keywordBlue: 'var(--color-token-keyword-blue)',
  variable: 'var(--color-token-variable)',
  string: 'var(--color-token-string)',
  fn: 'var(--color-token-function)',
  type: 'var(--color-token-type)',
  plain: 'var(--color-text-primary)',
}

const CODE_LINES: { num: number; tokens: Token[] }[] = [
  {
    num: 1,
    tokens: [
      { text: 'import ', color: T.keyword },
      { text: 'React, { useEffect, useRef } ', color: T.variable },
      { text: 'from ', color: T.keyword },
      { text: "'react'", color: T.string },
    ],
  },
  {
    num: 2,
    tokens: [
      { text: 'import ', color: T.keyword },
      { text: 'MonacoEditor ', color: T.variable },
      { text: 'from ', color: T.keyword },
      { text: "'@monaco-editor/react'", color: T.string },
    ],
  },
  {
    num: 3,
    tokens: [
      { text: 'import ', color: T.keyword },
      { text: '* as Y ', color: T.variable },
      { text: 'from ', color: T.keyword },
      { text: "'yjs'", color: T.string },
    ],
  },
  {
    num: 4,
    tokens: [
      { text: 'import ', color: T.keyword },
      { text: '{ WebsocketProvider } ', color: T.variable },
      { text: 'from ', color: T.keyword },
      { text: "'y-websocket'", color: T.string },
    ],
  },
  { num: 5, tokens: [] },
  {
    num: 6,
    tokens: [
      { text: 'export default function ', color: T.keywordBlue },
      { text: 'Editor', color: T.fn },
      { text: '() {', color: T.plain },
    ],
  },
  {
    num: 7,
    tokens: [
      { text: '  const ', color: T.keywordBlue },
      { text: 'ydoc ', color: T.variable },
      { text: '= ', color: T.plain },
      { text: 'useRef', color: T.fn },
      { text: '(new ', color: T.plain },
      { text: 'Y.Doc', color: T.type },
      { text: '()).current', color: T.plain },
    ],
  },
  {
    num: 8,
    tokens: [
      { text: '  const ', color: T.keywordBlue },
      { text: 'provider ', color: T.variable },
      { text: '= new ', color: T.plain },
      { text: 'WebsocketProvider', color: T.type },
      { text: '(url, room, ydoc)', color: T.plain },
    ],
  },
  {
    num: 9,
    tokens: [
      { text: '  return ', color: T.keywordBlue },
      { text: '<MonacoEditor ', color: T.type },
      { text: 'language', color: T.variable },
      { text: '=', color: T.plain },
      { text: '"javascript"', color: T.string },
      { text: ' />', color: T.type },
    ],
  },
  { num: 10, tokens: [{ text: '}', color: T.plain }] },
]

export default function EditorArea() {
  return (
    <div className="flex-1 flex flex-col bg-bg-primary overflow-hidden min-w-0">
      {/* Tab bar */}
      <div className="flex items-end bg-bg-secondary border-b border-border shrink-0 h-9">
        <div className="flex items-center gap-2 px-4 h-full bg-bg-primary border-t-2 border-t-accent text-text-primary text-[13px]">
          <span>Editor.jsx</span>
          <button className="text-text-primary/30 hover:text-text-primary/70 text-sm leading-none transition-colors">
            ×
          </button>
        </div>
      </div>

      {/* Code editor */}
      <div className="flex-1 overflow-auto">
        <div className="flex min-h-full">
          <div
            className="select-none text-right text-text-muted text-[13px] leading-[1.6] bg-bg-primary py-3 shrink-0"
            style={{ minWidth: '44px', paddingRight: '12px', paddingLeft: '8px' }}
          >
            {CODE_LINES.map((line) => (
              <div key={line.num}>{line.num}</div>
            ))}
          </div>

          <div className="flex-1 py-3 pr-8 overflow-x-auto font-mono text-[13px] leading-[1.6]">
            {CODE_LINES.map((line) => (
              <div key={line.num} className="whitespace-pre">
                {line.tokens.length === 0
                  ? ' '
                  : line.tokens.map((token, i) => (
                      <span key={i} style={{ color: token.color }}>
                        {token.text}
                      </span>
                    ))}
              </div>
            ))}
          </div>
        </div>
      </div>

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
