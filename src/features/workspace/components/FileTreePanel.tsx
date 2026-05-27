import { useState } from 'react'
import type { ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { useFileTree } from '../hooks/useFileTree'
import type { FileNode } from '../types'

interface TreeNodeProps {
  name: string
  isFolder?: boolean
  isOpen?: boolean
  isSelected?: boolean
  depth?: number
  children?: ReactNode
  onToggle?: () => void
}

function TreeNode({
  name,
  isFolder,
  isOpen,
  isSelected,
  depth = 0,
  children,
  onToggle,
}: TreeNodeProps) {
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
        onClick={onToggle}
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

function FileTreeNode({ node, depth = 0 }: { node: FileNode; depth?: number }) {
  const [isOpen, setIsOpen] = useState(true)
  const isFolder = node.type === 'FOLDER'

  return (
    <TreeNode
      name={node.name}
      isFolder={isFolder}
      isOpen={isOpen}
      depth={depth}
      onToggle={() => isFolder && setIsOpen((prev) => !prev)}
    >
      {node.children?.map((child) => (
        <FileTreeNode key={child.id} node={child} depth={depth + 1} />
      ))}
    </TreeNode>
  )
}

export default function FileTreePanel() {
  const { projectId = '' } = useParams<{ projectId: string }>()
  const { data: tree, isLoading, isError } = useFileTree(projectId)

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
        {isLoading && (
          <p className="px-3 py-2 text-[12px] text-text-primary/30">불러오는 중...</p>
        )}
        {isError && (
          <p className="px-3 py-2 text-[12px] text-red-400/70">파일 트리를 불러올 수 없습니다.</p>
        )}
        {!isLoading && !isError && (!tree || tree.length === 0) && (
          <p className="px-3 py-2 text-[12px] text-text-primary/30">파일이 없습니다.</p>
        )}
        {tree?.map((node) => (
          <FileTreeNode key={node.id} node={node} depth={0} />
        ))}
      </div>
    </div>
  )
}
