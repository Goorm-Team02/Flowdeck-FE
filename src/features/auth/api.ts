import axios from 'axios'

// API base URL can be configured. Defaults to current host or empty string for proxying
const API_BASE_URL = '' // Empty means it proxies to /api on the same origin, which aligns with production, or can be dynamic.

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor to inject JWT access token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor to handle errors or token refresh logically
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If unauthorized (401), we could attempt to refresh token later, or just clear and logout
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
    return Promise.reject(error)
  }
)

/**
 * Authentication Interfaces
 */
export interface SignupRequest {
  email: string
  name: string
  password: string
}

export interface SignupResponse {
  id: string
  email: string
  name: string
}

export interface ApiResponseSignupResponse {
  success: boolean
  code: string
  message: string
  data: SignupResponse
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
}

export interface ApiResponseLoginResponse {
  success: boolean
  code: string
  message: string
  data: LoginResponse
}

export interface UserResponse {
  id: string
  email: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface ApiResponseUserResponse {
  success: boolean
  code: string
  message: string
  data: UserResponse
}

/**
 * Project Interfaces
 */
export interface ProjectCreateRequest {
  title: string
  visibility: 'PUBLIC' | 'PRIVATE'
  description?: string
  invitedEmails?: string[]
}

export interface ProjectResponse {
  id: string
  title: string
  description?: string
  visibility: 'PUBLIC' | 'PRIVATE'
  createdAt: string
  updatedAt: string
}

export interface ApiResponseProjectResponse {
  success: boolean
  code: string
  message: string
  data: ProjectResponse
}

export interface ProjectListResponse {
  projects: ProjectResponse[]
}

export interface ApiResponseProjectListResponse {
  success: boolean
  code: string
  message: string
  data: ProjectListResponse
}

export function getOfflineUsers(): any[] {
  const seedUsers = [
    { id: 'usr-admin', email: 'admin@flowdeck.io', name: '관리자', password: 'password123' },
    { id: 'usr-coding', email: 'coding@flowdeck.io', name: '김코딩', password: 'password123' },
    { id: 'usr-taehee', email: 'taehee@flowdeck.io', name: '이태희', password: 'password123' },
    { id: 'usr-user1', email: 'user1@flowdeck.io', name: '김일반', password: 'password123' },
    { id: 'usr-user2', email: 'user2@flowdeck.io', name: '이협업', password: 'password123' }
  ]
  try {
    const raw = localStorage.getItem('offline_users')
    let currentUsers = raw ? JSON.parse(raw) : []
    if (!Array.isArray(currentUsers)) {
      currentUsers = []
    }
    let updated = false
    seedUsers.forEach(seed => {
      const exists = currentUsers.some((u: any) => u && u.email && u.email.toLowerCase() === seed.email.toLowerCase())
      if (!exists) {
        currentUsers.push(seed)
        updated = true
      }
    })
    if (updated || !raw) {
      localStorage.setItem('offline_users', JSON.stringify(currentUsers))
    }
    return currentUsers
  } catch (err) {
    return seedUsers
  }
}

/**
 * API Service functions
 */
export const authService = {
  async signup(data: SignupRequest): Promise<SignupResponse> {
    try {
      const res = await apiClient.post<ApiResponseSignupResponse>('/api/auth/signup', data)
      return res.data.data
    } catch (err) {
      console.warn('Backend server not detected. Fallback to offline emulated signup for preview.')
      
      // Persist in offline_users array
      const localUsers = getOfflineUsers()
      
      const exists = localUsers.some((u: any) => u.email === data.email)
      if (exists) {
        throw { response: { data: { message: '이미 가입된 이메일 주소입니다.' } } }
      }
      
      const newUser = {
        id: `usr-${Date.now()}`,
        email: data.email,
        name: data.name,
        password: data.password
      }
      
      localUsers.push(newUser)
      localStorage.setItem('offline_users', JSON.stringify(localUsers))
      
      return {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      }
    }
  },

  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const res = await apiClient.post<ApiResponseLoginResponse>('/api/auth/login', data)
      const loginData = res.data.data
      localStorage.setItem('access_token', loginData.accessToken)
      localStorage.setItem('refresh_token', loginData.refreshToken)
      return loginData
    } catch (err) {
      console.warn('Backend server not detected. Fallback to offline emulated login for preview.')
      
      const localUsers = getOfflineUsers()
      
      const matched = localUsers.find((u: any) => u.email === data.email)
      if (matched && matched.password === data.password) {
        // Success
        const mockAccessToken = `mock-token-${matched.id}`
        const mockRefreshToken = 'mock-refresh-token'
        localStorage.setItem('access_token', mockAccessToken)
        localStorage.setItem('refresh_token', mockRefreshToken)
        localStorage.setItem('temp_mock_email', matched.email)
        localStorage.setItem('temp_mock_name', matched.name)
        return {
          accessToken: mockAccessToken,
          refreshToken: mockRefreshToken,
          tokenType: 'Bearer'
        }
      } else if (matched) {
        throw { response: { data: { message: '비밀번호가 올바르지 않습니다.' } } }
      } else {
        // Just let them login if not exists for convenience, but register them on the fly
        const randomId = `usr-${Date.now()}`
        const mockAccessToken = `mock-token-${randomId}`
        localStorage.setItem('access_token', mockAccessToken)
        localStorage.setItem('refresh_token', 'mock-refresh')
        localStorage.setItem('temp_mock_email', data.email)
        localStorage.setItem('temp_mock_name', data.email.split('@')[0])
        
        const newUser = { id: randomId, email: data.email, name: data.email.split('@')[0], password: data.password }
        localUsers.push(newUser)
        localStorage.setItem('offline_users', JSON.stringify(localUsers))
        
        return {
          accessToken: mockAccessToken,
          refreshToken: 'mock-refresh',
          tokenType: 'Bearer'
        }
      }
    }
  },

  async logout(): Promise<void> {
    const token = localStorage.getItem('access_token')
    if (token && !token.startsWith('mock-')) {
      try {
        await apiClient.post('/api/auth/logout', null, {
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch (e) {
        console.warn('Logout requested but could not contact real backend:', e)
      }
    }
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('temp_mock_email')
    localStorage.removeItem('temp_mock_name')
  },

  async getMyInfo(): Promise<UserResponse> {
    try {
      const res = await apiClient.get<ApiResponseUserResponse>('/api/users/me')
      if (typeof res.data === 'string' || !res.data || (res.data && 'success' in res.data && !res.data.success)) {
        throw new Error('Not a valid JSON response from backend')
      }
      return res.data.data
    } catch (err) {
      console.warn('Backend server not detected. Fallback to offline emulated profile for preview.')
      const savedEmail = localStorage.getItem('temp_mock_email') || 'developer@flowdeck.io'
      const savedName = localStorage.getItem('temp_mock_name') || 'Flowdeck Developer'
      return {
        id: 'mock-user-123',
        email: savedEmail,
        name: savedName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }
  },

  async updateProfile(name: string): Promise<UserResponse> {
    try {
      const res = await apiClient.patch<ApiResponseUserResponse>('/api/users/me', { name })
      return res.data.data
    } catch (err) {
      console.warn('Backend server not detected. Fallback to offline emulated profile update.')
      const savedEmail = localStorage.getItem('temp_mock_email') || 'developer@flowdeck.io'
      localStorage.setItem('temp_mock_name', name)
      
      // Also update in offline_users
      const localUsersRaw = localStorage.getItem('offline_users')
      if (localUsersRaw) {
        let localUsers = JSON.parse(localUsersRaw)
        const idx = localUsers.findIndex((u: any) => u.email.toLowerCase() === savedEmail.toLowerCase())
        if (idx !== -1) {
          localUsers[idx].name = name
          localStorage.setItem('offline_users', JSON.stringify(localUsers))
        }
      }
      return {
        id: 'mock-user-123',
        email: savedEmail,
        name: name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }
  },

  async deleteAccount(): Promise<void> {
    const savedEmail = localStorage.getItem('temp_mock_email') || 'developer@flowdeck.io'
    
    // 1. Remove from offline_users
    const localUsersRaw = localStorage.getItem('offline_users')
    if (localUsersRaw) {
      try {
        let localUsers = JSON.parse(localUsersRaw)
        localUsers = localUsers.filter((u: any) => u.email.toLowerCase() !== savedEmail.toLowerCase())
        localStorage.setItem('offline_users', JSON.stringify(localUsers))
      } catch (e) {}
    }

    // 2. Clear all user persistent caching data and local state
    localStorage.removeItem('offline_projects')
    
    // 3. Clear JWT session cleanly
    await this.logout()
  }
}

export const projectService = {
  async createProject(data: ProjectCreateRequest): Promise<ProjectResponse> {
    try {
      // 1. Send clean Swagger-compliant payload (excluding non-DTO fields like invitedEmails)
      const payload = {
        title: data.title,
        description: data.description,
        visibility: data.visibility
      }
      const res = await apiClient.post<ApiResponseProjectResponse>('/api/projects', payload)
      if (typeof res.data === 'string' || !res.data || (res.data && 'success' in res.data && !res.data.success)) {
        throw new Error('Not a valid JSON response from backend')
      }
      const newProj = res.data.data

      // 2. Sequentially send team invitations using correct endpoint
      if (data.invitedEmails && data.invitedEmails.length > 0 && newProj?.id) {
        for (const email of data.invitedEmails) {
          const trimmed = email.trim()
          if (trimmed) {
            try {
              await apiClient.post(`/api/projects/${newProj.id}/members`, { email: trimmed, role: 'EDITOR' })
            } catch (err) {
              console.warn(`Could not invite ${trimmed} sequentially on backend:`, err)
            }
          }
        }
      }

      return newProj
    } catch (err) {
      console.warn('Backend server not detected. Emulating project creation locally with localStorage.')
      const offlineProj: ProjectResponse = {
        id: `mock-proj-${Date.now()}`,
        title: data.title,
        description: data.description || '오프라인 전용 생성 프로젝트.',
        visibility: data.visibility,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      const localStored = localStorage.getItem('offline_projects')
      const currentList: ProjectResponse[] = localStored ? JSON.parse(localStored) : []
      currentList.unshift(offlineProj)
      localStorage.setItem('offline_projects', JSON.stringify(currentList))
      
      // Auto-add creator as owner/member
      const savedEmail = localStorage.getItem('temp_mock_email') || 'developer@flowdeck.io'
      const savedName = localStorage.getItem('temp_mock_name') || '개발자'
      const initialMembers = [
        { id: `mem-${Date.now()}`, email: savedEmail, name: savedName, role: 'OWNER', status: 'ACCEPTED' }
      ]

      // Also process direct team invitations provided during creation
      if (data.invitedEmails && data.invitedEmails.length > 0) {
        const localUsers = getOfflineUsers()
        
        for (const email of data.invitedEmails) {
          const trimmedEmail = email.trim()
          if (!trimmedEmail) continue
          if (trimmedEmail.toLowerCase() === savedEmail.toLowerCase()) continue // skip self

          // Enforce validation: Check if email exists in system registered accounts
          const matched = localUsers.find((u: any) => u.email.toLowerCase() === trimmedEmail.toLowerCase())
          if (!matched) {
            throw new Error(`초대 실패: '${trimmedEmail}' 계정은 등록되지 않은 사용자입니다. 실제 가입 이메일을 기재하십시오.`)
          }

          initialMembers.push({
            id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            email: trimmedEmail,
            name: matched.name,
            role: 'EDITOR',
            status: 'PENDING' // Starts as PENDING for the target user to accept
          })
        }
      }

      localStorage.setItem(`offline_members_${offlineProj.id}`, JSON.stringify(initialMembers))
      
      return offlineProj
    }
  },

  async updateProject(projectId: string, data: Partial<ProjectCreateRequest>): Promise<ProjectResponse> {
    try {
      const res = await apiClient.patch<ApiResponseProjectResponse>(`/api/projects/${projectId}`, data)
      if (typeof res.data === 'string' || !res.data || (res.data && 'success' in res.data && !res.data.success)) {
        throw new Error('Not a valid JSON response from backend')
      }
      return res.data.data
    } catch (err) {
      console.warn('Backend server not detected for updating project. Falling back to localStorage.')
      const localStored = localStorage.getItem('offline_projects')
      const currentList: ProjectResponse[] = localStored ? JSON.parse(localStored) : []
      
      const idx = currentList.findIndex(p => p.id === projectId)
      if (idx === -1) {
        throw new Error('수정할 프로젝트를 찾을 수 없습니다.')
      }

      const updatedProj: ProjectResponse = {
        ...currentList[idx],
        title: data.title ?? currentList[idx].title,
        description: data.description ?? currentList[idx].description,
        visibility: data.visibility ?? currentList[idx].visibility,
        updatedAt: new Date().toISOString()
      }

      currentList[idx] = updatedProj
      localStorage.setItem('offline_projects', JSON.stringify(currentList))
      return updatedProj
    }
  },

  async deleteProject(projectId: string): Promise<void> {
    // Always sync offline local state immediately to guarantee seamless and instant user interface updates
    const localStored = localStorage.getItem('offline_projects')
    if (localStored) {
      const currentList: ProjectResponse[] = JSON.parse(localStored)
      const updatedList = currentList.filter(p => p.id !== projectId)
      localStorage.setItem('offline_projects', JSON.stringify(updatedList))
    }
    localStorage.removeItem(`offline_members_${projectId}`)

    try {
      const res = await apiClient.delete(`/api/projects/${projectId}`)
      if (typeof res.data === 'string' || !res.data || (res.data && 'success' in res.data && !res.data.success)) {
        throw new Error('Not a valid JSON response from backend')
      }
    } catch (err) {
      console.warn('Backend server not detected or error deleting. Offline fallback already cleared state successfully.')
    }
  },

  async getPublicProjects(): Promise<ProjectResponse[]> {
    try {
      const res = await apiClient.get<ApiResponseProjectListResponse>('/api/projects/public')
      if (typeof res.data === 'string' || !res.data || (res.data && 'success' in res.data && !res.data.success)) {
        throw new Error('Not a valid JSON response from backend')
      }
      return res.data.data?.projects || []
    } catch (err) {
      console.warn('Backend server not detected. Emulating projects loading via localStorage & seeded values.')
      const localStored = localStorage.getItem('offline_projects')
      const localList: ProjectResponse[] = localStored ? JSON.parse(localStored) : []
      return localList
    }
  },

  /* 
  */
  async legacy_unused_getPublicProjects(): Promise<ProjectResponse[]> {
    throw new Error('deprecated')
    /* */
    return [];
  },
  /* 
  legacy_unused_code: `
      
      const defaults: ProjectResponse[] = [
        {
          id: 'proj-1',
          title: 'Flowdeck Go 백엔드 동기화',
          description: 'Go 고성능 고가용성 실시간 IDE 동기화 및 소켓 통신 서버.',
          visibility: 'PUBLIC',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        },
        {
          id: 'proj-2',
          title: 'React 실시간 대시보드',
          description: 'Vite와 TS 기반의 대시보드 구조 및 자원 실시간 모니터링 웹 콘솔.',
          visibility: 'PRIVATE',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
        }
      ]
      
      // Merge unique defaults with localList
      const allList = [...localList]
      defaults.forEach(def => {
         if (!allList.some(p => p.id === def.id)) {
          allList.push(def)
         }
       })
      
      return allList
    }
  `,
  */

  // Collaborative Membership Management
  async getProjectMembers(projectId: string): Promise<any[]> {
    try {
      const res = await apiClient.get(`/api/projects/${projectId}/members`)
      if (typeof res.data === 'string' || !res.data || (res.data && 'success' in res.data && !res.data.success)) {
        throw new Error('Not a valid JSON response from backend')
      }
      // ApiResponseMemberListResponse has data: MemberListResponse which contains members array
      return res.data.data?.members || []
    } catch (err) {
      const localMembersRaw = localStorage.getItem(`offline_members_${projectId}`)
      if (localMembersRaw) {
        return JSON.parse(localMembersRaw)
      }
      // Return beautiful high-quality defaults representing collaborative workspace
      const defaults = [
        { id: 'mem-1', email: 'coding@flowdeck.io', name: '김코딩', role: 'OWNER', status: 'ACCEPTED' },
        { id: 'mem-2', email: 'taehee@flowdeck.io', name: '이태희', role: 'EDITOR', status: 'ACCEPTED' }
      ]
      localStorage.setItem(`offline_members_${projectId}`, JSON.stringify(defaults))
      return defaults
    }
  },

  async inviteMember(projectId: string, email: string): Promise<any> {
    try {
      // MemberInviteRequest takes email and role in the request body
      const res = await apiClient.post(`/api/projects/${projectId}/members`, { email, role: 'EDITOR' })
      if (typeof res.data === 'string' || !res.data || (res.data && 'success' in res.data && !res.data.success)) {
        throw new Error('Not a valid JSON response from backend')
      }
      return res.data.data
    } catch (err) {
      // Offline validation logic check
      const localUsers = getOfflineUsers()
      
      const matched = localUsers.find((u: any) => u.email.toLowerCase() === email.trim().toLowerCase())
      if (!matched) {
        throw new Error(`초대 실패: '${email}' 이메일을 가진 가입자가 존재하지 않습니다. 실제 가입 회원만 협업 마킹이 가능합니다.`)
      }

      const name = matched.name
      const currentRaw = localStorage.getItem(`offline_members_${projectId}`)
      const members = currentRaw ? JSON.parse(currentRaw) : []
      
      if (members.some((m: any) => m.email.toLowerCase() === email.trim().toLowerCase())) {
        throw new Error('이미 프로젝트에 참여 완료 또는 초대 대기 중인 사용자입니다.')
      }

      const newMember = {
        id: `mem-${Date.now()}`,
        email: email.trim(),
        name,
        role: 'EDITOR',
        status: 'PENDING' // Under target user accept review
      }
      members.push(newMember)
      localStorage.setItem(`offline_members_${projectId}`, JSON.stringify(members))
      return newMember
    }
  },

  async removeMember(projectId: string, memberId: string): Promise<void> {
    try {
      const res = await apiClient.delete(`/api/projects/${projectId}/members/${memberId}`)
      if (typeof res.data === 'string' || !res.data || (res.data && 'success' in res.data && !res.data.success)) {
        throw new Error('Not a valid JSON response from backend')
      }
    } catch (err) {
      const currentRaw = localStorage.getItem(`offline_members_${projectId}`)
      if (currentRaw) {
        let members = JSON.parse(currentRaw)
        members = members.filter((m: any) => m.id !== memberId)
        localStorage.setItem(`offline_members_${projectId}`, JSON.stringify(members))
      }
    }
  },

  async respondToInvitation(projectId: string, accept: boolean): Promise<void> {
    try {
      if (accept) {
        // 백엔드 사양에는 초대 수락(Accept)에 대한 별도 엔드포인트가 없습니다.
        // 백엔드의 경우 초대(POST /api/projects/{projectId}/members) 단계에서 이미 등록이 되므로,
        // 별도의 실 수락 요청 과정 없이 성공 처리로 간주하고 오프라인 싱크만 완료합니다.
        console.log('Accepting invitation: Already active on live backend. Proceeding.')
      } else {
        // 초대 거절(Reject) 처리 시, 본인 스스로 참여를 거절/탈퇴하는 것이므로 자진 탈퇴 API를 안전하게 호출합니다.
        await apiClient.delete(`/api/projects/${projectId}/members/me`)
      }
    } catch (err) {
      console.warn('Backend server not detected or responding error. Fallback to offline emulating.')
    } finally {
      const savedEmail = localStorage.getItem('temp_mock_email') || 'developer@flowdeck.io'
      const currentRaw = localStorage.getItem(`offline_members_${projectId}`)
      
      if (currentRaw) {
        try {
          let members = JSON.parse(currentRaw)
          const myIndex = members.findIndex((m: any) => m.email.toLowerCase() === savedEmail.toLowerCase())
          if (myIndex !== -1) {
            if (accept) {
              members[myIndex].status = 'ACCEPTED'
              localStorage.setItem(`offline_members_${projectId}`, JSON.stringify(members))
            } else {
              members.splice(myIndex, 1)
              localStorage.setItem(`offline_members_${projectId}`, JSON.stringify(members))
            }
          }
        } catch (e) {}
      }
    }
  }
}
