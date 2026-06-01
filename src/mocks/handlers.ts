// src/mocks/handlers.ts
import { HttpResponse, http } from 'msw'

import type {
  FileDetail,
  FileNode,
  FileVersion,
  FileVersionDetail,
  Member,
  TimelineVersionCard,
} from '@/features/workspace/types'
import type { ProjectMessage } from '@/shared/socket/types'
import type { ApiResponse } from '@/shared/types/api'

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
const PROJECT_ID = '1'
const FILE_ID = 10

// --- [추가] 가상 세션: 현재 로그인한 이메일을 동적으로 기억합니다 ---
let currentUserEmail = 'admin@flowdeck.io'

const mockUsers = [
  { email: 'admin@flowdeck.io', name: '시스템 관리자' },
  { email: 'minkyoung@example.com', name: '김민경' },
  { email: 'jihoon@example.com', name: '이지훈' },
  { email: 'jihoon.park@example.com', name: '박지훈' },
]

const mockProjects = [
  {
    id: '1',
    title: 'API-Gateway-Refactor',
    description: '성공적으로 창포된 최적화된 협업 디렉토리 프로젝트입니다.',
    visibility: 'PRIVATE' as 'PRIVATE' | 'PUBLIC',
  }
]

// --- 기존 상대방 Mock 데이터 유지 ---
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

const mockMembers: Member[] = [
  {
    memberId: 1,
    userId: 'user-001',
    email: 'minkyoung@example.com',
    name: '김민경',
    role: 'OWNER',
    joinedAt: '2026-05-01T09:00:00Z',
  },
  {
    memberId: 2,
    userId: 'user-002',
    email: 'jihoon@example.com',
    name: '이지훈',
    role: 'EDITOR',
    joinedAt: '2026-05-10T11:00:00Z',
  },
  {
    memberId: 3,
    userId: 'user-003',
    email: 'jihoon.park@example.com',
    name: '박지훈',
    role: 'VIEWER',
    joinedAt: '2026-05-15T14:30:00Z',
  },
]

const mockMessages: ProjectMessage[] = [
  {
    id: 1,
    userId: 10,
    senderName: '김민경',
    messageType: 'CHAT',
    content:
      'Editor.jsx에서 Yjs 적용한 부분 한번 봐주세요. v4 슬라이드에서 변경 내역 확인 가능해요.',
    createdAt: '2026-05-28T01:21:00Z',
  },
  {
    id: 2,
    userId: 11,
    senderName: '이지훈',
    messageType: 'CHAT',
    content: '확인했어요 👍 WebSocket 연결 부분은 잘 합쳐졌네요.',
    createdAt: '2026-05-28T01:24:00Z',
  },
  {
    id: 3,
    userId: 10,
    senderName: '김민경',
    messageType: 'LOG',
    content: 'App.tsx가 v3으로 복원됐습니다.',
    createdAt: '2026-05-28T01:28:00Z',
  },
  {
    id: 4,
    userId: 12,
    senderName: '박지훈',
    messageType: 'CHAT',
    content: '저는 README 업데이트 맡을게요!',
    createdAt: '2026-05-28T01:32:00Z',
  },
]

function ok<T>(data: T): HttpResponse<ApiResponse<T>> {
  const body: ApiResponse<T> = { success: true, code: 'SUCCESS', message: '', data }
  return HttpResponse.json(body)
}

export const handlers = [
  // --- [인프라] 활성 가상 유저 가동 (로그인 안내용) ---
  http.get(`${BASE}/api/auth/users`, () => {
    return HttpResponse.json(mockUsers)
  }),

  // --- [인증] 회원가입 ---
  http.post(`${BASE}/api/auth/signup`, async ({ request }) => {
    const body = (await request.json()) as { email: string; name: string }
    const exists = mockUsers.some(u => u.email === body.email)
    if (exists) {
      return HttpResponse.json(
        { message: '이미 가입된 이메일 주소입니다.' },
        { status: 400 }
      )
    }
    const newUser = { email: body.email, name: body.name }
    mockUsers.push(newUser)
    return HttpResponse.json({
      message: '회원 가입 완료',
      user: newUser
    })
  }),

  // --- [인증] 로그인 (현재 로그인 시도한 이메일을 세션에 실시간 주입) ---
  http.post(`${BASE}/api/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password?: string }
    if (!body.email) {
      return HttpResponse.json(
        {
          success: false,
          code: 'INVALID_CREDENTIALS',
          message: '이메일을 다시 확인해 주세요.',
          data: null,
        },
        { status: 400 },
      )
    }

    // [중요] 세션 기록 갱신
    currentUserEmail = body.email.toLowerCase();

    const matchedUser = mockUsers.find(u => u.email.toLowerCase() === body.email.toLowerCase()) || {
      email: body.email,
      name: body.email.split('@')[0]
    }

    const payload = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      message: '성공적으로 인증되었습니다.',
      user: matchedUser
    }

    const envelope: ApiResponse<typeof payload> = {
      success: true,
      code: 'SUCCESS',
      message: '성공적으로 로그인되었습니다.',
      data: payload
    }

    return HttpResponse.json({
      ...envelope,
      ...payload
    })
  }),

  // --- [인증] 내 세션 조회 (현재 로그인된 정보를 바탕으로 응답) ---
  http.get(`${BASE}/api/auth/me`, () => {
    const matchedUser = mockUsers.find(u => u.email.toLowerCase() === currentUserEmail.toLowerCase()) || {
      email: currentUserEmail,
      name: currentUserEmail.split('@')[0]
    }
    return HttpResponse.json(matchedUser)
  }),

  // --- [인증] 프로필 이름 변경 ---
  http.put(`${BASE}/api/auth/profile`, async ({ request }) => {
    const body = (await request.json()) as { name: string }
    const idx = mockUsers.findIndex(u => u.email.toLowerCase() === currentUserEmail.toLowerCase())
    if (idx !== -1) {
      mockUsers[idx].name = body.name
    }
    return HttpResponse.json({ message: '성공적으로 수정 완료', name: body.name })
  }),

  // --- [인증] 회원 탈퇴 ---
  http.delete(`${BASE}/api/auth/profile`, () => {
    return HttpResponse.json({ message: '회원 정보가 영구적으로 파기되었습니다.' })
  }),

  // --- [대시보드] 내 프로젝트 목록 조회 ---
  http.get(`${BASE}/api/projects`, () => {
    return HttpResponse.json(mockProjects)
  }),

  // --- [대시보드] 새 프로젝트 추가 생성 ---
  http.post(`${BASE}/api/projects`, async ({ request }) => {
    const body = (await request.json()) as { title: string; visibility: 'PRIVATE' | 'PUBLIC'; description?: string }
    const newProject = {
      id: String(mockProjects.length + 100),
      title: body.title,
      description: body.description || '',
      visibility: body.visibility,
    }
    mockProjects.push(newProject)
    return HttpResponse.json(newProject)
  }),

  // --- [대시보드] 프로젝트 디렉토리 정보 수정 ---
  http.put(`${BASE}/api/projects/:projectId`, async ({ params, request }) => {
    const id = params.projectId as string
    const body = (await request.json()) as { title?: string; description?: string; visibility?: 'PRIVATE' | 'PUBLIC' }
    const idx = mockProjects.findIndex(p => p.id === id)
    if (idx !== -1) {
      mockProjects[idx] = {
        ...mockProjects[idx],
        ...body
      }
      return HttpResponse.json(mockProjects[idx])
    }
    return HttpResponse.json({ message: '프로젝트를 찾을 수 없습니다.' }, { status: 404 })
  }),

  // --- [대시보드] 프로젝트 완전 파기 ---
  http.delete(`${BASE}/api/projects/:projectId`, ({ params }) => {
    const id = params.projectId as string
    const idx = mockProjects.findIndex(p => p.id === id)
    if (idx !== -1) {
      mockProjects.splice(idx, 1)
    }
    return HttpResponse.json({ message: '프로젝트 파괴 성공' })
  }),

  // --- [대시보드] 협업 초대 응답 처리 ---
  http.post(`${BASE}/api/projects/:projectId/respond`, () => {
    return HttpResponse.json({ message: '승인 처리가 수락되었습니다.' })
  }),

  // --- [보완 완료] 멤버 가입 (새 가상 프로젝트 ID도 통과 허용) ---
  http.post(`${BASE}/api/projects/:projectId/members/join`, ({ params }) => {
    const newMember: Member = {
      memberId: mockMembers.length + 20,
      userId: `user-invite-${Date.now()}`,
      email: 'invited@example.com',
      name: '초대된 사용자',
      role: 'VIEWER',
      joinedAt: new Date().toISOString(),
    }
    
    const exists = mockProjects.some(p => p.id === params.projectId)
    if (!exists && params.projectId !== PROJECT_ID) {
      return HttpResponse.json(
        { success: false, code: 'NOT_FOUND', message: 'Project not found', data: null },
        { status: 404 },
      )
    }
    mockMembers.push(newMember)
    return ok(newMember)
  }),

  // --- [보완 완료] 파일 트리 조회 ---
  http.get(`${BASE}/api/projects/:projectId/files`, ({ params }) => {
    const projId = params.projectId as string

    if (projId === PROJECT_ID) {
      return ok(mockFileTree)
    }

    const exists = mockProjects.some(p => p.id === projId)
    if (!exists) {
      return HttpResponse.json(
        { success: false, code: 'NOT_FOUND', message: 'Project not found', data: null },
        { status: 404 },
      )
    }

    const defaultId = Number(projId) * 1000 + 1
    const newProjectFileTree: FileNode[] = [
      {
        id: defaultId,
        name: 'README.md',
        type: 'FILE',
        parentId: null,
        editRevision: 1,
        currentVersion: 1,
      }
    ]
    return ok(newProjectFileTree)
  }),

  // --- [보완 완료] 파일 상세조회 ---
  http.get(`${BASE}/api/projects/:projectId/files/:fileId`, ({ params }) => {
    const id = Number(params.fileId)
    let file = mockFiles[id]

    if (!file && id > 1000) {
      file = {
        id,
        name: 'README.md',
        type: 'FILE',
        parentId: null,
        editRevision: 1,
        currentVersion: 1,
        content: `# Welcome to Flowdeck!\n\n성공적으로 생성된 새로운 작업 공간입니다. 코드를 수정하고 실시간 동화를 시작하세요.`
      }
      mockFiles[id] = file
    }

    if (!file) {
      return HttpResponse.json(
        { success: false, code: 'NOT_FOUND', message: 'File not found', data: null },
        { status: 404 },
      )
    }
    return ok(file)
  }),

  http.put(`${BASE}/api/projects/:projectId/files/:fileId`, async ({ params, request }) => {
    const id = Number(params.fileId)
    const file = mockFiles[id]
    if (!file)
      return HttpResponse.json(
        { success: false, code: 'NOT_FOUND', message: 'File not found', data: null },
        { status: 404 },
      )
    const body = (await request.json()) as { content: string; baseRevision: number }
    mockFiles[id] = { ...file, content: body.content, editRevision: file.editRevision + 1 }
    return ok(mockFiles[id])
  }),

  http.get(`${BASE}/api/projects/:projectId/files/:fileId/versions`, ({ params }) => {
    if (Number(params.fileId) !== FILE_ID) return ok([])
    return ok(mockVersions)
  }),

  http.get(`${BASE}/api/projects/:projectId/files/:fileId/versions/timeline`, ({ params }) => {
    if (Number(params.fileId) !== FILE_ID) return ok([])
    return ok(mockTimeline)
  }),

  http.get(`${BASE}/api/projects/:projectId/files/:fileId/versions/:versionId`, ({ params }) => {
    const versionId = Number(params.versionId)
    const version = mockVersions.find((v) => v.id === versionId)
    if (!version)
      return HttpResponse.json(
        { success: false, code: 'NOT_FOUND', message: 'Version not found', data: null },
        { status: 404 },
      )
    const detail: FileVersionDetail = { ...version, content: mockVersionContents[versionId] ?? '' }
    return ok(detail)
  }),

  // --- [보완 완료] 멤버 목록 조회 (현재 로그인한 사용자를 OWNER로 설정하여 화면 표시 누락 우려 차단) ---
  http.get(`${BASE}/api/projects/:projectId/members`, ({ params }) => {
    const projId = params.projectId as string

    if (projId === PROJECT_ID) {
      return ok({ members: mockMembers })
    }

    const exists = mockProjects.some(p => p.id === projId)
    if (!exists) {
      return HttpResponse.json(
        { success: false, code: 'NOT_FOUND', message: 'Project not found', data: null },
        { status: 404 },
      )
    }

    // 세션 상의 로그인 유저 정보를 동적으로 반영하여 소유권을 가집니다.
    const currentUserName = currentUserEmail.split('@')[0];
    const newProjectMembers: Member[] = [
      {
        memberId: 99,
        userId: `user-${currentUserName}`,
        email: currentUserEmail,
        name: currentUserName,
        role: 'OWNER',
        joinedAt: new Date().toISOString(),
      }
    ]
    return ok({ members: newProjectMembers })
  }),

  http.post(`${BASE}/api/projects/:projectId/members`, async ({ request }) => {
    const body = (await request.json()) as { email: string; role: 'EDITOR' | 'VIEWER' }
    const { email, role } = body

    if (mockMembers.some((m) => m.email === email))
      return HttpResponse.json(
        {
          success: false,
          code: 'ALREADY_MEMBER',
          message: '이미 프로젝트 멤버입니다.',
          data: null,
        },
        { status: 409 },
      )

    if (email.startsWith('unknown@'))
      return HttpResponse.json(
        {
          success: false,
          code: 'USER_NOT_FOUND',
          message: '존재하지 않는 이메일입니다.',
          data: null,
        },
        { status: 404 },
      )

    const newMember: Member = {
      memberId: mockMembers.length + 10,
      userId: `user-${Date.now()}`,
      email,
      name: email.split('@')[0],
      role,
      joinedAt: new Date().toISOString(),
    }
    mockMembers.push(newMember)
    return ok(newMember)
  }),

  http.patch(`${BASE}/api/projects/:projectId/members/:memberId`, async ({ params, request }) => {
    const memberId = Number(params.memberId)
    const idx = mockMembers.findIndex((m) => m.memberId === memberId)
    if (idx === -1)
      return HttpResponse.json(
        { success: false, code: 'NOT_FOUND', message: 'Member not found', data: null },
        { status: 404 },
      )

    const owners = mockMembers.filter((m) => m.role === 'OWNER')
    const target = mockMembers[idx]
    const body = (await request.json()) as { role: string }

    if (target.role === 'OWNER' && owners.length === 1 && body.role !== 'OWNER')
      return HttpResponse.json(
        {
          success: false,
          code: 'LAST_OWNER_CONSTRAINT',
          message: '마지막 OWNER의 권한은 변경할 수 없습니다.',
          data: null,
        },
        { status: 403 },
      )

    mockMembers[idx] = { ...target, role: body.role as Member['role'] }
    return ok(mockMembers[idx])
  }),

  http.delete(`${BASE}/api/projects/:projectId/members/me`, () => {
    return ok({})
  }),

  http.delete(`${BASE}/api/projects/:projectId/members/:memberId`, ({ params }) => {
    const memberId = Number(params.memberId)
    const idx = mockMembers.findIndex((m) => m.memberId === memberId)
    if (idx === -1)
      return HttpResponse.json(
        { success: false, code: 'NOT_FOUND', message: 'Member not found', data: null },
        { status: 404 },
      )

    const owners = mockMembers.filter((m) => m.role === 'OWNER')
    const target = mockMembers[idx]
    if (target.role === 'OWNER' && owners.length === 1)
      return HttpResponse.json(
        {
          success: false,
          code: 'LAST_OWNER_CONSTRAINT',
          message: '마지막 OWNER는 제거할 수 없습니다.',
          data: null,
        },
        { status: 403 },
      )

    mockMembers.splice(idx, 1)
    return ok({})
  }),

  // --- [보완 완료] 채팅 메시지 목록 ---
  http.get(`${BASE}/api/projects/:projectId/messages`, ({ params }) => {
    const projId = params.projectId as string

    if (projId === PROJECT_ID) {
      return ok({ messages: mockMessages })
    }

    const exists = mockProjects.some(p => p.id === projId)
    if (!exists) {
      return HttpResponse.json(
        { success: false, code: 'NOT_FOUND', message: 'Project not found', data: null },
        { status: 404 },
      )
    }

    return ok({ messages: [] })
  }),

  http.get(`${BASE}/api/projects/:projectId/messages/search`, ({ request }) => {
    const url = new URL(request.url)
    const keyword = url.searchParams.get('keyword') ?? ''
    const results = keyword
      ? mockMessages.filter((m) => m.content.toLowerCase().includes(keyword.toLowerCase()))
      : []
    return ok({ messages: results })
  }),

  http.delete(`${BASE}/api/projects/:projectId/messages/:messageId`, ({ params }) => {
    const messageId = Number(params.messageId)
    const idx = mockMessages.findIndex((m) => m.id === messageId)
    if (idx === -1)
      return HttpResponse.json(
        { success: false, code: 'NOT_FOUND', message: 'Message not found', data: null },
        { status: 404 },
      )
    mockMessages.splice(idx, 1)
    return ok({})
  }),

  http.post(`${BASE}/api/projects/:projectId/files/:fileId/versions`, ({ params }) => {
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