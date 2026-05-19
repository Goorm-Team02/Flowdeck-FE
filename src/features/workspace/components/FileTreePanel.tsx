import type { ReactNode } from 'react'

interface TreeNodeProps {
  name: string
  isFolder?: boolean
  isOpen?: boolean
  isSelected?: boolean
  depth?: number
  children?: ReactNode
}

function TreeNode({ name, isFolder, isOpen, isSelected, depth = 0, children }: TreeNodeProps) {
  const ext = name.split('.').pop()
  const fileStrokeColor =
    ext === 'tsx' || ext === 'ts'
      ? 'var(--color-icon-ts)'
      : ext === 'jsx' || ext === 'js'
        ? 'var(--color-icon-js)'
        : ext === 'json'
          ? 'var(--color-icon-json)'
          : ext === 'md'
            ? 'var(--color-icon-md)'
            : 'var(--color-text-primary)'

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 py-[3px] cursor-pointer text-[13px] select-none ${
          isSelected ? 'bg-bg-selected text-text-primary' : 'text-text-primary/70 hover:bg-bg-hover'
        }`}
        style={{ paddingLeft: `${8 + depth * 12}px` }}
      >
        {isFolder ? (
          <>
            <span className="text-text-primary/30 text-[10px] w-3 shrink-0">
              {isOpen ? '▾' : '▸'}
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" className="fill-icon-folder shrink-0">
              <path d="M10 4H2v16h20V6H12l-2-2z" />
            </svg>
          </>
        ) : (
          <>
            <span className="w-3 shrink-0" />
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="1.5"
              className="shrink-0"
              style={{ stroke: fileStrokeColor }}
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </>
        )}
        <span className="truncate">{name}</span>
      </div>
      {isFolder && isOpen && children}
    </div>
  )
}

export default function FileTreePanel() {
  return (
    <div className="w-56 flex flex-col bg-bg-secondary border-r border-border shrink-0 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 shrink-0">
        <span className="text-[11px] font-semibold text-text-primary/40 uppercase tracking-wider">
          파일트리
        </span>
        <button className="text-text-primary/30 hover:text-text-primary/70 text-base leading-none transition-colors">
          ›
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <TreeNode name="src" isFolder isOpen depth={0}>
          <TreeNode name="components" isFolder isOpen depth={1}>
            <TreeNode name="Button.tsx" depth={2} />
            <TreeNode name="Header.tsx" depth={2} />
            <TreeNode name="Editor.jsx" isSelected depth={2} />
          </TreeNode>
          <TreeNode name="App.tsx" depth={1} />
        </TreeNode>
        <TreeNode name="public" isFolder isOpen depth={0} />
        <TreeNode name="favicon.ico" depth={0} />
        <TreeNode name="package.json" depth={0} />
        <TreeNode name="README.md" depth={0} />
      </div>
    </div>
  )
}
