import { http, HttpResponse } from 'msw'

import type { FileDetail, FileNode, FileVersion, FileVersionDetail, TimelineVersionCard } from '@/features/workspace/types'
import type { ApiResponse } from '@/shared/types/api'

const PROJECT_ID = '1'
const FILE_ID = 10

const mockFileTree: FileNode[] = [
  {
    id: 1,
    name: 'src',
    type: 'FOLDER',
    parentId: null,
    children: [
      {
        id: FILE_ID,
        name: 'App.tsx',
        type: 'FILE',
        parentId: 1,
        editRevision: 3,
        currentVersion: 3,
      },
      {
        id: 11,
        name: 'main.tsx',
        type: 'FILE',
        parentId: 1,
        editRevision: 1,
        currentVersion: 1,
      },
    ],
  },
  {
    id: 2,
    name: 'package.json',
    type: 'FILE',
    parentId: null,
    editRevision: 1,
    currentVersion: 1,
  },
]

const mockFiles: Record<number, FileDetail> = {
  [FILE_ID]: {
    id: FILE_ID,
    name: 'App.tsx',
    type: 'FILE',
    parentId: 1,
    editRevision: 3,
    currentVersion: 3,
    content: `import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <h1>Flowdeck</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>
        Increment
      </button>
    </div>
  )
}

export default App`,
  },
  11: {
    id: 11,
    name: 'main.tsx',
    type: 'FILE',
    parentId: 1,
    editRevision: 1,
    currentVersion: 1,
    content: `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)`,
  },
  2: {
    id: 2,
    name: 'package.json',
    type: 'FILE',
    parentId: null,
    editRevision: 1,
    currentVersion: 1,
    content: `{
  "name": "flowdeck-fe",
  "version": "0.1.0",
  "private": true
}`,
  },
}

const mockVersions: FileVersion[] = [
  { id: 101, version: 1, authorName: '김민경', savedAt: '2026-05-25T10:00:00Z' },
  { id: 102, version: 2, authorName: '이지훈', savedAt: '2026-05-26T14:30:00Z' },
  { id: 103, version: 3, authorName: '김민경', savedAt: '2026-05-27T09:15:00Z' },
]

const mockVersionContents: Record<number, string> = {
  101: `import { useState } from 'react'

function App() {
  return (
    <div>
      <h1>Hello World</h1>
    </div>
  )
}

export default App`,
  102: `import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <h1>Flowdeck</h1>
      <p>Count: {count}</p>
    </div>
  )
}

export default App`,
  103: `import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <h1>Flowdeck</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>
        Increment
      </button>
    </div>
  )
}

export default App`,
}

const mockTimeline: TimelineVersionCard[] = [
  {
    id: 101,
    version: 1,
    authorName: '김민경',
    savedAt: '2026-05-25T10:00:00Z',
    content: mockVersionContents[101],
    diffSummary: null,
  },
  {
    id: 102,
    version: 2,
    authorName: '이지훈',
    savedAt: '2026-05-26T14:30:00Z',
    content: mockVersionContents[102],
    diffSummary: { added: 4, removed: 1 },
  },
  {
    id: 103,
    version: 3,
    authorName: '김민경',
    savedAt: '2026-05-27T09:15:00Z',
    content: mockVersionContents[103],
    diffSummary: { added: 4, removed: 1 },
  },
]

function ok<T>(data: T): HttpResponse<ApiResponse<T>> {
  const body: ApiResponse<T> = { success: true, code: 'SUCCESS', message: '', data }
  return HttpResponse.json(body)
}

export const handlers = [
  // File tree
  http.get('/api/projects/:projectId/files', ({ params }) => {
    if (params.projectId !== PROJECT_ID) return HttpResponse.json({ success: false, code: 'NOT_FOUND', message: 'Project not found', data: null }, { status: 404 })
    return ok(mockFileTree)
  }),

  // File detail (must come before move/rename PATCH)
  http.get('/api/projects/:projectId/files/:fileId', ({ params }) => {
    const id = Number(params.fileId)
    const file = mockFiles[id]
    if (!file) return HttpResponse.json({ success: false, code: 'NOT_FOUND', message: 'File not found', data: null }, { status: 404 })
    return ok(file)
  }),

  // Save file
  http.put('/api/projects/:projectId/files/:fileId', async ({ params, request }) => {
    const id = Number(params.fileId)
    const file = mockFiles[id]
    if (!file) return HttpResponse.json({ success: false, code: 'NOT_FOUND', message: 'File not found', data: null }, { status: 404 })
    const body = await request.json() as { content: string; baseRevision: number }
    mockFiles[id] = { ...file, content: body.content, editRevision: file.editRevision + 1 }
    return ok(mockFiles[id])
  }),

  // Version list
  http.get('/api/projects/:projectId/files/:fileId/versions', ({ params }) => {
    if (Number(params.fileId) !== FILE_ID) return ok([])
    return ok(mockVersions)
  }),

  // Timeline (must come before detail because "timeline" would match :versionId)
  http.get('/api/projects/:projectId/files/:fileId/versions/timeline', ({ params }) => {
    if (Number(params.fileId) !== FILE_ID) return ok([])
    return ok(mockTimeline)
  }),

  // Version detail
  http.get('/api/projects/:projectId/files/:fileId/versions/:versionId', ({ params }) => {
    const versionId = Number(params.versionId)
    const version = mockVersions.find((v) => v.id === versionId)
    if (!version) return HttpResponse.json({ success: false, code: 'NOT_FOUND', message: 'Version not found', data: null }, { status: 404 })
    const detail: FileVersionDetail = { ...version, content: mockVersionContents[versionId] ?? '' }
    return ok(detail)
  }),

  // Create version
  http.post('/api/projects/:projectId/files/:fileId/versions', ({ params }) => {
    const fileId = Number(params.fileId)
    const lastVersion = mockVersions.at(-1)?.version ?? 0
    const newId = (mockVersions.at(-1)?.id ?? 200) + 1
    const newVersion: FileVersion = {
      id: newId,
      version: lastVersion + 1,
      authorName: '김민경',
      savedAt: new Date().toISOString(),
    }
    const content = mockFiles[fileId]?.content ?? ''
    mockVersions.push(newVersion)
    mockVersionContents[newId] = content
    mockTimeline.push({ ...newVersion, content, diffSummary: { added: 1, removed: 0 } })
    return ok({ fileId, version: newVersion.version, savedAt: newVersion.savedAt })
  }),
]
