import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useParams } from 'react-router-dom'

import { useAtom, useAtomValue } from 'jotai'

import { isApiError } from '@/shared/api/errors'

import { useCreateFile } from '../hooks/useCreateFile'
import { useDeleteFile } from '../hooks/useDeleteFile'
import { useFileTree } from '../hooks/useFileTree'
import { useMoveFile } from '../hooks/useMoveFile'
import { useRenameFile } from '../hooks/useRenameFile'
import { fileEditorsAtom } from '../stores/fileEditorAtom'
import type { FileEditor } from '../stores/fileEditorAtom'
import { openFileIdAtom } from '../stores/openFileAtom'
import type { FileNode, FileNodeType } from '../types'

// ─── 드래그 앤 드롭 핸들러 묶음 ──────────────────────────────────────────────

interface DragHandlers {
  draggingId: number | null
  dropTargetId: number | 'root' | null
  onDragStart: (nodeId: number) => void
  onDragEnd: () => void
  onDragOver: (targetId: number | 'root') => void
  onDrop: (targetId: number | 'root') => void
}

// VIEWER 권한 여부 — 추후 auth 연동 시 실제 권한으로 교체
const useIsViewer = () => false

// parentId 필드 대신 트리 구조를 탐색해 실제 부모 ID를 반환
function findParentId(nodes: FileNode[], id: number, parentId: number | null = null): number | null | undefined {
  for (const node of nodes) {
    if (node.id === id) return parentId
    if (node.children) {
      const result = findParentId(node.children, id, node.id)
      if (result !== undefined) return result
    }
  }
  return undefined
}

// ─── 인라인 입력 (생성/이름 변경) ───────────────────────────────────────────

interface InlineInputProps {
  defaultValue?: string
  onConfirm: (value: string) => void
  onCancel: () => void
  depth: number
  icon: 'file' | 'folder'
}

function InlineInput({ defaultValue = '', onConfirm, onCancel, depth, icon }: InlineInputProps) {
  const [value, setValue] = useState(defaultValue)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const trimmed = value.trim()
      if (trimmed) onConfirm(trimmed)
      else onCancel()
    }
    if (e.key === 'Escape') onCancel()
  }

  return (
    <div
      className="flex items-center gap-1.5 py-[3px]"
      style={{ paddingLeft: `${8 + depth * 12 + 12}px` }}
    >
      {icon === 'folder' ? (
        <svg width="14" height="14" viewBox="0 0 24 24" className="fill-icon-folder shrink-0">
          <path d="M10 4H2v16h20V6H12l-2-2z" />
        </svg>
      ) : (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="1.5"
          stroke="var(--color-text-primary)"
          className="shrink-0"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      )}
      <input
        ref={inputRef}
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          const trimmed = value.trim()
          if (trimmed) onConfirm(trimmed)
          else onCancel()
        }}
        className="flex-1 bg-bg-tertiary border border-accent/60 rounded px-1 py-px text-[13px] text-text-primary outline-none"
      />
    </div>
  )
}

// ─── 삭제 확인 모달 ──────────────────────────────────────────────────────────

interface DeleteConfirmProps {
  name: string
  onConfirm: () => void
  onCancel: () => void
}

function DeleteConfirmModal({ name, onConfirm, onCancel }: DeleteConfirmProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-bg-secondary border border-border rounded-xl p-6 w-72 shadow-2xl">
        <h3 className="text-[15px] font-semibold text-text-primary mb-2">삭제 확인</h3>
        <p className="text-[13px] text-text-primary/60 mb-5 leading-relaxed">
          <span className="text-text-primary font-medium">{name}</span>을(를) 삭제합니다. 이 작업은
          되돌릴 수 없습니다.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 text-[13px] text-text-primary/60 hover:text-text-primary transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1.5 text-[13px] bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── 트리 노드 ────────────────────────────────────────────────────────────────

interface FileTreeNodeProps {
  node: FileNode
  depth: number
  openFileId: number | null
  isViewer: boolean
  drag: DragHandlers
  fileEditors: Map<number, FileEditor>
  onFileClick: (id: number) => void
  onCreate: (parentId: number | null, name: string, type: FileNodeType) => void
  onRename: (fileId: number, name: string) => void
  onDeleteRequest: (node: FileNode) => void
}

function FileTreeNode({
  node,
  depth,
  openFileId,
  isViewer,
  drag,
  fileEditors,
  onFileClick,
  onCreate,
  onRename,
  onDeleteRequest,
}: FileTreeNodeProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [isRenaming, setIsRenaming] = useState(false)
  const [creatingType, setCreatingType] = useState<FileNodeType | null>(null)
  const isFolder = node.type === 'FOLDER'
  const activeEditor = isFolder ? undefined : fileEditors.get(node.id)

  const ext = node.name.split('.').pop()
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

  const handleRowClick = () => {
    if (isFolder) setIsOpen((prev) => !prev)
    else onFileClick(node.id)
  }

  const handleRenameConfirm = (name: string) => {
    if (name !== node.name) onRename(node.id, name)
    setIsRenaming(false)
  }

  const handleCreateConfirm = (name: string) => {
    if (creatingType) onCreate(node.id, name, creatingType)
    setCreatingType(null)
  }

  return (
    <div>
      {/* Row */}
      {isRenaming ? (
        <InlineInput
          defaultValue={node.name}
          onConfirm={handleRenameConfirm}
          onCancel={() => setIsRenaming(false)}
          depth={depth}
          icon={isFolder ? 'folder' : 'file'}
        />
      ) : (
        <div
          draggable={!isViewer}
          className={`group flex items-center gap-1.5 py-[3px] cursor-pointer text-[13px] select-none ${
            openFileId === node.id && !isFolder
              ? 'bg-bg-selected text-text-primary'
              : isFolder && drag.dropTargetId === node.id
                ? 'bg-accent/15 text-text-primary outline outline-1 outline-accent/50'
                : 'text-text-primary/70 hover:bg-bg-hover'
          }`}
          style={{ paddingLeft: `${8 + depth * 12}px` }}
          onClick={handleRowClick}
          onDragStart={(e) => {
            e.stopPropagation()
            drag.onDragStart(node.id)
          }}
          onDragEnd={(e) => {
            e.stopPropagation()
            drag.onDragEnd()
          }}
          onDragOver={
            isFolder
              ? (e) => {
                  if (drag.draggingId === node.id) return
                  e.preventDefault()
                  e.stopPropagation()
                  drag.onDragOver(node.id)
                }
              : undefined
          }
          onDrop={
            isFolder
              ? (e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  drag.onDrop(node.id)
                }
              : undefined
          }
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

          <span className="flex-1 truncate">{node.name}</span>

          {/* 편집 중인 사용자 배지 */}
          {activeEditor && (
            <span
              title={`${activeEditor.actorName}님이 편집 중`}
              className="shrink-0 mr-1 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-accent/15 text-accent/80 border border-accent/20"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse inline-block" />
              {activeEditor.actorName.slice(0, 3)}
            </span>
          )}

          {/* 호버 액션 버튼 (VIEWER 제외) */}
          {!isViewer && (
            <div
              className="flex items-center gap-0.5 pr-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              {isFolder && (
                <>
                  <button
                    title="새 파일"
                    onClick={() => {
                      setIsOpen(true)
                      setCreatingType('FILE')
                    }}
                    className="p-0.5 rounded text-text-primary/40 hover:text-text-primary/80 hover:bg-bg-tertiary transition-colors"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="12" y1="18" x2="12" y2="12" />
                      <line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                  </button>
                  <button
                    title="새 폴더"
                    onClick={() => {
                      setIsOpen(true)
                      setCreatingType('FOLDER')
                    }}
                    className="p-0.5 rounded text-text-primary/40 hover:text-text-primary/80 hover:bg-bg-tertiary transition-colors"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      <line x1="12" y1="11" x2="12" y2="17" />
                      <line x1="9" y1="14" x2="15" y2="14" />
                    </svg>
                  </button>
                </>
              )}
              <button
                title="이름 변경"
                onClick={() => setIsRenaming(true)}
                className="p-0.5 rounded text-text-primary/40 hover:text-text-primary/80 hover:bg-bg-tertiary transition-colors"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                title="삭제"
                onClick={() => onDeleteRequest(node)}
                className="p-0.5 rounded text-text-primary/40 hover:text-red-400 hover:bg-bg-tertiary transition-colors"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4h6v2" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 폴더 열림 상태 + 새 항목 생성 입력 */}
      {isFolder && isOpen && (
        <>
          {node.children?.map((child) => (
            <FileTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              openFileId={openFileId}
              isViewer={isViewer}
              drag={drag}
              fileEditors={fileEditors}
              onFileClick={onFileClick}
              onCreate={onCreate}
              onRename={onRename}
              onDeleteRequest={onDeleteRequest}
            />
          ))}
          {creatingType && (
            <InlineInput
              onConfirm={handleCreateConfirm}
              onCancel={() => setCreatingType(null)}
              depth={depth + 1}
              icon={creatingType === 'FOLDER' ? 'folder' : 'file'}
            />
          )}
        </>
      )}
    </div>
  )
}

// ─── 패널 ─────────────────────────────────────────────────────────────────────

export default function FileTreePanel() {
  const { projectId = '' } = useParams<{ projectId: string }>()
  const { data: tree, isLoading, isError } = useFileTree(projectId)
  const [openFileId, setOpenFileId] = useAtom(openFileIdAtom)
  const fileEditors = useAtomValue(fileEditorsAtom)
  const isViewer = useIsViewer()

  const { mutate: create } = useCreateFile(projectId)
  const { mutate: rename } = useRenameFile(projectId)
  const { mutate: remove, reset: resetDelete } = useDeleteFile(projectId)
  const { mutate: move, error: moveError, reset: resetMove } = useMoveFile(projectId)

  const [deleteTarget, setDeleteTarget] = useState<FileNode | null>(null)
  const [isDeleteConflictOpen, setIsDeleteConflictOpen] = useState(false)
  const [rootCreatingType, setRootCreatingType] = useState<FileNodeType | null>(null)

  const [draggingId, setDraggingId] = useState<number | null>(null)
  const [dropTargetId, setDropTargetId] = useState<number | 'root' | null>(null)

  const isMoveConflict = isApiError(moveError) && moveError.status === 409

  const dragHandlers: DragHandlers = {
    draggingId,
    dropTargetId,
    onDragStart: (nodeId) => {
      setDraggingId(nodeId)
    },
    onDragEnd: () => {
      setDraggingId(null)
      setDropTargetId(null)
    },
    onDragOver: (targetId) => setDropTargetId(targetId),
    onDrop: (targetId) => {
      if (!draggingId || !tree) return
      const newParentId = targetId === 'root' ? null : targetId

      const currentParentId = findParentId(tree, draggingId)
      const isSameParent = currentParentId === newParentId
      const isSelf = newParentId === draggingId

      if (!isSameParent && !isSelf) {
        move({ fileId: draggingId, newParentId })
      }
      setDraggingId(null)
      setDropTargetId(null)
    },
  }

  const handleCreate = (parentId: number | null, name: string, type: FileNodeType) => {
    create({ parentId, name, type })
  }

  const handleRename = (fileId: number, name: string) => {
    rename({ fileId, name })
  }

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    setIsDeleteConflictOpen(false)
    remove(
      { fileId: deleteTarget.id, expectedRevision: deleteTarget.editRevision ?? 0 },
      {
        onError: (error) => {
          if (isApiError(error) && error.status === 409) {
            setIsDeleteConflictOpen(true)
          }
        },
      },
    )
    setDeleteTarget(null)
  }

  const closeDeleteConflict = () => {
    setIsDeleteConflictOpen(false)
    resetDelete()
  }

  const isDeleteConflict = isDeleteConflictOpen

  return (
    <>
      <div className="w-56 flex flex-col bg-bg-secondary border-r border-border shrink-0 overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-3 py-2 shrink-0">
          <span className="text-[11px] font-semibold text-text-primary/40 uppercase tracking-wider">
            파일트리
          </span>
          {!isViewer && (
            <div className="flex items-center gap-0.5">
              <button
                title="새 파일"
                onClick={() => setRootCreatingType('FILE')}
                className="p-0.5 rounded text-text-primary/30 hover:text-text-primary/70 hover:bg-bg-tertiary transition-colors"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </button>
              <button
                title="새 폴더"
                onClick={() => setRootCreatingType('FOLDER')}
                className="p-0.5 rounded text-text-primary/30 hover:text-text-primary/70 hover:bg-bg-tertiary transition-colors"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  <line x1="12" y1="11" x2="12" y2="17" />
                  <line x1="9" y1="14" x2="15" y2="14" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* 트리 (루트 드롭존 포함) */}
        <div
          className={`flex-1 overflow-y-auto ${dropTargetId === 'root' ? 'outline outline-1 outline-accent/40' : ''}`}
          onDragOver={
            !isViewer
              ? (e) => {
                  e.preventDefault()
                  dragHandlers.onDragOver('root')
                }
              : undefined
          }
          onDrop={
            !isViewer
              ? (e) => {
                  e.preventDefault()
                  dragHandlers.onDrop('root')
                }
              : undefined
          }
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropTargetId(null)
          }}
        >
          {isLoading && (
            <p className="px-3 py-2 text-[12px] text-text-primary/30">불러오는 중...</p>
          )}
          {isError && (
            <p className="px-3 py-2 text-[12px] text-red-400/70">파일 트리를 불러올 수 없습니다.</p>
          )}
          {!isLoading && !isError && (!tree || tree.length === 0) && !rootCreatingType && (
            <p className="px-3 py-2 text-[12px] text-text-primary/30">파일이 없습니다.</p>
          )}
          {tree?.map((node) => (
            <FileTreeNode
              key={node.id}
              node={node}
              depth={0}
              openFileId={openFileId}
              isViewer={isViewer}
              drag={dragHandlers}
              fileEditors={fileEditors}
              onFileClick={setOpenFileId}
              onCreate={handleCreate}
              onRename={handleRename}
              onDeleteRequest={setDeleteTarget}
            />
          ))}
          {rootCreatingType && (
            <InlineInput
              onConfirm={(name) => {
                handleCreate(null, name, rootCreatingType)
                setRootCreatingType(null)
              }}
              onCancel={() => setRootCreatingType(null)}
              depth={0}
              icon={rootCreatingType === 'FOLDER' ? 'folder' : 'file'}
            />
          )}
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <DeleteConfirmModal
          name={deleteTarget.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* 이동 실패 안내 */}
      {isMoveConflict && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-secondary border border-border rounded-xl p-6 w-72 shadow-2xl">
            <h3 className="text-[15px] font-semibold text-text-primary mb-2">이동 실패</h3>
            <p className="text-[13px] text-text-primary/60 mb-5 leading-relaxed">
              {isApiError(moveError) ? moveError.message : '파일을 이동할 수 없습니다.'}
            </p>
            <div className="flex justify-end">
              <button
                onClick={resetMove}
                className="px-4 py-1.5 text-[13px] bg-accent text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 충돌 안내 */}
      {isDeleteConflict && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-secondary border border-border rounded-xl p-6 w-72 shadow-2xl">
            <h3 className="text-[15px] font-semibold text-text-primary mb-2">삭제 충돌 발생</h3>
            <p className="text-[13px] text-text-primary/60 mb-5 leading-relaxed">
              파일이 다른 사용자에 의해 수정되었습니다. 최신 상태를 확인해 주세요.
            </p>
            <div className="flex justify-end">
              <button
                onClick={closeDeleteConflict}
                className="px-4 py-1.5 text-[13px] bg-accent text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
