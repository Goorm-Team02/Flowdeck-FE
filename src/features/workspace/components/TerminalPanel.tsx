import { useEffect, useRef, useState } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import { isRunningAtom, runTriggerAtom, stopTriggerAtom } from '../stores/terminalAtom'

type LineType = 'default' | 'success' | 'error' | 'info' | 'link' | 'muted' | 'warning'

interface TermLine {
  id: number
  text: string
  type: LineType
  isPrompt?: boolean
}

const TYPE_CLASS: Record<LineType, string> = {
  default: 'text-text-primary/85',
  success: 'text-terminal-green',
  error: 'text-red-400',
  info: 'text-terminal-blue',
  link: 'text-terminal-blue underline cursor-pointer',
  muted: 'text-text-primary/40',
  warning: 'text-yellow-400',
}

let uid = 0
const line = (text: string, type: LineType = 'default', isPrompt = false): TermLine => ({
  id: uid++,
  text,
  type,
  isPrompt,
})

const DEV_STEPS: Array<{ delay: number; text: string; type: LineType }> = [
  { delay: 50, text: '', type: 'default' },
  { delay: 120, text: '> react-dashboard@0.0.0 dev', type: 'muted' },
  { delay: 180, text: '> vite', type: 'info' },
  { delay: 550, text: '', type: 'default' },
  { delay: 650, text: '  VITE v6.3.5  ready in 412 ms', type: 'success' },
  { delay: 750, text: '', type: 'default' },
  { delay: 850, text: '  ➜  Local:   http://localhost:5173/', type: 'link' },
  { delay: 950, text: '  ➜  Network: use --host to expose', type: 'info' },
]

const BUILD_STEPS: Array<{ delay: number; text: string; type: LineType }> = [
  { delay: 50, text: '> react-dashboard@0.0.0 build', type: 'muted' },
  { delay: 100, text: '> tsc -b && vite build', type: 'info' },
  { delay: 600, text: '', type: 'default' },
  { delay: 700, text: 'vite v6.3.5 building client...', type: 'muted' },
  { delay: 1300, text: '✓ 110 modules transformed.', type: 'success' },
  { delay: 1450, text: 'dist/assets/index.css    22.82 kB │ gzip: 4.90 kB', type: 'default' },
  { delay: 1550, text: 'dist/assets/index.js    356.89 kB │ gzip: 111 kB', type: 'default' },
  { delay: 1650, text: '', type: 'default' },
  { delay: 1750, text: '✓ built in 110ms', type: 'success' },
]

const INSTALL_STEPS: Array<{ delay: number; text: string; type: LineType }> = [
  { delay: 100, text: 'npm warn deprecated glob@7.2.3', type: 'warning' },
  { delay: 600, text: 'added 192 packages in 4s', type: 'default' },
  { delay: 750, text: '', type: 'default' },
  { delay: 850, text: '55 packages are looking for funding', type: 'muted' },
  { delay: 950, text: '  run `npm fund` for details', type: 'muted' },
]

export default function TerminalPanel() {
  const [lines, setLines] = useState<TermLine[]>([])
  const [input, setInput] = useState('')
  const [cmdHistory, setCmdHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const [isRunning, setIsRunning] = useAtom(isRunningAtom)
  const runTrigger = useAtomValue(runTriggerAtom)
  const stopTrigger = useAtomValue(stopTriggerAtom)
  const prevRun = useRef(0)
  const prevStop = useRef(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerIds = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [lines, isRunning])

  useEffect(() => {
    if (runTrigger > prevRun.current) {
      prevRun.current = runTrigger
      runDevServer()
    }
  }, [runTrigger])

  useEffect(() => {
    if (stopTrigger > prevStop.current) {
      prevStop.current = stopTrigger
      stopDevServer()
    }
  }, [stopTrigger])

  const append = (text: string, type: LineType = 'default', isPrompt = false) => {
    setLines((prev) => [...prev, line(text, type, isPrompt)])
  }

  const appendMany = (newLines: TermLine[]) => {
    setLines((prev) => [...prev, ...newLines])
  }

  const scheduleSteps = (
    steps: Array<{ delay: number; text: string; type: LineType }>,
    onDone?: () => void,
  ) => {
    timerIds.current.forEach(clearTimeout)
    timerIds.current = []

    steps.forEach(({ delay, text, type }) => {
      const id = setTimeout(() => append(text, type), delay)
      timerIds.current.push(id)
    })

    if (onDone) {
      const lastDelay = steps[steps.length - 1]?.delay ?? 0
      const id = setTimeout(onDone, lastDelay + 50)
      timerIds.current.push(id)
    }
  }

  const runDevServer = () => {
    if (isRunning) {
      append('npm run dev', 'default', true)
      append('error: dev server is already running.', 'error')
      return
    }
    append('npm run dev', 'default', true)
    setIsRunning(true)
    scheduleSteps(DEV_STEPS)
  }

  const stopDevServer = () => {
    timerIds.current.forEach(clearTimeout)
    timerIds.current = []
    setIsRunning(false)
    appendMany([line('^C', 'warning'), line('', 'default'), line('dev server stopped.', 'muted')])
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim()
    if (!trimmed) {
      append('', 'default', true)
      return
    }

    setCmdHistory((prev) => [trimmed, ...prev.slice(0, 49)])
    setHistIdx(-1)

    const [command, ...args] = trimmed.split(/\s+/)

    switch (command) {
      case 'help':
        append(trimmed, 'default', true)
        appendMany([
          line('Available commands:', 'muted'),
          line('  help             show this help', 'default'),
          line('  ls               list files', 'default'),
          line('  pwd              print working directory', 'default'),
          line('  echo <text>      print text', 'default'),
          line('  clear            clear terminal', 'default'),
          line('  npm run dev      start dev server', 'default'),
          line('  npm run build    build project', 'default'),
          line('  npm install      install dependencies', 'default'),
        ])
        break

      case 'ls':
        append(trimmed, 'default', true)
        append('src/  public/  package.json  README.md  vite.config.ts', 'info')
        break

      case 'pwd':
        append(trimmed, 'default', true)
        append('/workspace/react-dashboard')
        break

      case 'echo':
        append(trimmed, 'default', true)
        append(args.join(' '))
        break

      case 'clear':
        setLines([])
        break

      case 'npm':
        if (args[0] === 'run' && args[1] === 'dev') {
          runDevServer()
        } else if (args[0] === 'run' && args[1] === 'build') {
          append(trimmed, 'default', true)
          scheduleSteps(BUILD_STEPS)
        } else if (args[0] === 'install' || args[0] === 'i') {
          append(trimmed, 'default', true)
          scheduleSteps(INSTALL_STEPS)
        } else {
          append(trimmed, 'default', true)
          append(`npm: unknown command '${args.join(' ')}'`, 'error')
        }
        break

      default:
        append(trimmed, 'default', true)
        append(`bash: command not found: ${command}`, 'error')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const cmd = input
      setInput('')
      executeCommand(cmd)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.min(histIdx + 1, cmdHistory.length - 1)
      setHistIdx(next)
      if (cmdHistory[next] !== undefined) setInput(cmdHistory[next])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = Math.max(histIdx - 1, -1)
      setHistIdx(next)
      setInput(next === -1 ? '' : (cmdHistory[next] ?? ''))
    } else if (e.key === 'c' && e.ctrlKey) {
      stopDevServer()
    }
  }

  return (
    <div className="h-44 flex flex-col border-t border-border shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-3 h-8 border-b border-border shrink-0 bg-bg-secondary">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-semibold text-text-primary/40 uppercase tracking-wider">
            터미널
          </span>
          {isRunning && (
            <span className="text-[12px] text-text-primary/70 bg-bg-tertiary px-2 py-0.5 rounded">
              npm run dev
            </span>
          )}
        </div>
        <button
          onClick={() => setLines([])}
          className="text-text-primary/30 hover:text-text-primary/60 transition-colors text-sm leading-none"
          title="터미널 지우기"
        >
          ×
        </button>
      </div>

      {/* Output */}
      <div
        className="flex-1 overflow-y-auto px-3 pt-2 font-mono text-[12px] bg-bg-primary"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((l) => (
          <div key={l.id} className={`whitespace-pre leading-[1.6] ${TYPE_CLASS[l.type]}`}>
            {l.isPrompt && (
              <>
                <span className="text-terminal-green">react-dashboard</span>
                <span className="text-text-primary/50">:~$ </span>
              </>
            )}
            {l.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input prompt */}
      <div className="px-3 py-1.5 flex items-center font-mono text-[12px] bg-bg-primary border-t border-border/40 shrink-0">
        <span className="text-terminal-green shrink-0">react-dashboard</span>
        <span className="text-text-primary/50 shrink-0">:~$&nbsp;</span>
        {isRunning ? (
          <span className="text-text-primary/35 flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-terminal-green animate-pulse" />
            <span>실행 중... (Ctrl+C 또는 정지 버튼으로 종료)</span>
          </span>
        ) : (
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-text-primary outline-none caret-white min-w-0"
            style={{ fontFamily: 'inherit', fontSize: 'inherit' }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck={false}
          />
        )}
      </div>
    </div>
  )
}
