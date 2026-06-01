import { 
  Plus, List, X, Settings, Users, Globe, LogOut, Terminal, 
  Shield, Server, Activity, ArrowUpRight, BarChart2, ShieldAlert, Cpu,
  Edit3, Trash2, User
} from 'lucide-react'
import React, { useState, useEffect, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../features/auth/authStore'
import { projectService, type ProjectResponse, apiClient, getOfflineUsers } from '../../features/auth/api'


type TabType = 'my' | 'shared' | 'public' | 'mypage' | 'settings' | 'admin'

export default function ProjectListPage() {
  const [activeTab, setActiveTab] = useState<TabType>('my')
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Custom project creation states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PRIVATE')
  const [invitedEmailsStr, setInvitedEmailsStr] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [apiProjects, setApiProjects] = useState<ProjectResponse[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)

  // Edit and Delete states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editVisibility, setEditVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PRIVATE')

  // Settings mock states
  const [editorTheme, setEditorTheme] = useState('one-dark')
  const [fontSize, setFontSize] = useState(14)
  const [tabSize, setTabSize] = useState(4)

  const { user, isLoggedIn, logout, updateProfile, deleteAccount } = useAuthStore()
  const [profileName, setProfileName] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.name) {
      setProfileName(user.name)
    }
  }, [user])

  const handleUpdateName = async (e: FormEvent) => {
    e.preventDefault()
    if (!profileName.trim()) return
    try {
      await updateProfile(profileName.trim())
      alert('사용자 정보(이름)가 성공적으로 변경되었습니다!')
    } catch (err: any) {
      alert(err.message || '이름 변경에 실패했습니다.')
    }
  }

  const handleDeleteAccount = async () => {
    const doubleConfirm = window.confirm(
      '정말 회원 탈퇴를 처리하시겠습니까?\n모든 프로젝트 참여 내역 및 로컬 디바이스 매핑 정보가 완전히 세밀하게 분쇄됩니다.'
    )
    if (!doubleConfirm) return
    try {
      await deleteAccount()
      alert('회원 탈퇴 처리가 정상 완료되었습니다. 이용해주셔서 감사합니다.')
      navigate('/login')
    } catch (err: any) {
      alert(err.message || '회원 탈퇴 처리 실패.')
    }
  }

  // Verify Admin privilege dynamically
  const isAdmin = user?.email && (user.email === 'admin@flowdeck.io' || user.email.startsWith('admin@'))

  // Calculate tactics and stats for analytics
  const getDynamicStats = () => {
    const usersList = getOfflineUsers()
    return {
      totalUsers: usersList.length,
      usersList
    }
  }

  const { totalUsers, usersList } = getDynamicStats()

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login')
    }
  }, [isLoggedIn, navigate])

  // Fetch Public/All Projects from the real backend (or cache fallback)
  const fetchProjects = async () => {
    if (!isLoggedIn) return
    setIsLoadingProjects(true)
    try {
      const fetched = await projectService.getPublicProjects()
      setApiProjects(fetched)
    } catch (err) {
      console.error('Failed to fetch public projects from API:', err)
    } finally {
      setIsLoadingProjects(false)
    }
  }

  // Answer Invitation response (Accept / Reject)
  const handleRespondToInvite = async (projectId: string, accept: boolean) => {
    try {
      await projectService.respondToInvitation(projectId, accept)
      await fetchProjects()
    } catch (err: any) {
      alert(err.message || '초대 처리 중 오류가 발생했습니다.')
    }
  }

  // Project Modification Actions
  const openEditModal = (project: any) => {
    setEditingProjectId(project.id)
    setEditTitle(project.title)
    setEditDescription(project.description || '')
    setEditVisibility(project.visibility.toUpperCase() === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE')
    setIsEditModalOpen(true)
  }

  const handleUpdateProject = async (e: FormEvent) => {
    e.preventDefault()
    if (!editingProjectId || !editTitle.trim()) return
    try {
      await projectService.updateProject(editingProjectId, {
        title: editTitle,
        description: editDescription,
        visibility: editVisibility
      })
      setIsEditModalOpen(false)
      setEditingProjectId(null)
      await fetchProjects()
    } catch (err: any) {
      alert(err.message || '프로젝트 수정 실패.')
    }
  }

  // Delete Action with event propagation blocking to avoid router click triggers
  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm('정말 이 프로젝트를 영구적으로 완전히 삭제하시겠습니까? 연관된 가상 디렉토리와 소켓 워크스페이스 세션 일체가 제거됩니다.')) return
    try {
      await projectService.deleteProject(projectId)
      await fetchProjects()
    } catch (err: any) {
      alert(err.message || '프로젝트 삭제 실패.')
    }
  }

  // Seed initial high-quality mock projects if they don't exist in localStorage
  useEffect(() => {
    const localStored = localStorage.getItem('offline_projects')
    if (!localStored) {
      const savedEmail = localStorage.getItem('temp_mock_email') || 'developer@flowdeck.io'
      const savedName = localStorage.getItem('temp_mock_name') || '김코딩'

      const initialProjects = [
        {
          id: 'proj-1',
          title: 'Flowdeck-백엔드-Go',
          description: 'WebRTC 및 WebSockets 통신을 위한 고가용성 협업 에디터 백엔드 모듈 개발 로직.',
          visibility: 'PRIVATE' as const,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
        },
        {
          id: 'proj-2',
          title: 'Python 데이터 가상화 API',
          description: 'Pandas 및 FastAPI를 이용한 실시간 지표 분석 가상 디렉토리 시스템.',
          visibility: 'PUBLIC' as const,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        }
      ]
      localStorage.setItem('offline_projects', JSON.stringify(initialProjects))
      
      const members1 = [
        { id: 'mem-1-1', email: savedEmail, name: savedName, role: 'OWNER', status: 'ACCEPTED' },
        { id: 'mem-1-2', email: 'taehee@flowdeck.io', name: '이태희', role: 'EDITOR', status: 'ACCEPTED' }
      ]
      const members2 = [
        { id: 'mem-2-1', email: 'coding@flowdeck.io', name: '김코딩', role: 'OWNER', status: 'ACCEPTED' },
        { id: 'mem-2-2', email: savedEmail, name: savedName, role: 'EDITOR', status: 'ACCEPTED' }
      ]
      localStorage.setItem('offline_members_proj-1', JSON.stringify(members1))
      localStorage.setItem('offline_members_proj-2', JSON.stringify(members2))
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [isLoggedIn, activeTab])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleCreateProject = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setError(null)
    setIsCreating(true)

    try {
      const emails = invitedEmailsStr
        .split(/[,\n]/)
        .map(email => email.trim())
        .filter(email => email.length > 0 && email.includes('@'))

      await projectService.createProject({
        title,
        visibility,
        description,
        invitedEmails: emails,
      })
      // Force refresh current projects list
      await fetchProjects()
      setIsModalOpen(false)
      // Reset form
      setTitle('')
      setDescription('')
      setVisibility('PRIVATE')
      setInvitedEmailsStr('')
    } catch (err: any) {
      console.error('Failed to create project:', err)
      const errMessage = err.response?.data?.message || '프로젝트 생성에 실패하였습니다. 다시 시도해주세요.'
      setError(errMessage)
    } finally {
      setIsCreating(false)
    }
  }

  // Rendered project list from the apiProjects state
  const allProjects = apiProjects.map(p => {
    // Resolve member list from database/localStorage
    const localMembersRaw = localStorage.getItem(`offline_members_${p.id}`)
    const membersList = localMembersRaw ? JSON.parse(localMembersRaw) : [
      { id: 'mem-1', email: 'coding@flowdeck.io', name: '김코딩', role: 'OWNER', status: 'ACCEPTED' },
      { id: 'mem-2', email: 'taehee@flowdeck.io', name: '이태희', role: 'EDITOR', status: 'ACCEPTED' }
    ]
    
    const ownerMember = membersList.find((m: any) => m.role === 'OWNER')
    const ownerName = ownerMember ? ownerMember.name : '김코딩'
    const ownerEmail = ownerMember ? ownerMember.email : 'coding@flowdeck.io'
    
    // Determine owner is current logged in user
    const isMyProject = ownerEmail.toLowerCase() === (user?.email || '').toLowerCase()

    return {
      id: p.id,
      title: p.title,
      description: p.description || '프로젝트 세부 정보 및 가이드라인이 비어 있습니다.',
      updatedAt: new Date(p.updatedAt || p.createdAt || Date.now()).toLocaleDateString(),
      visibility: p.visibility === 'PUBLIC' || p.visibility.toString().toUpperCase() === 'PUBLIC' ? 'Public' : 'Private',
      icon: p.visibility === 'PUBLIC' || p.visibility.toString().toUpperCase() === 'PUBLIC' ? '🌐' : '🔒',
      owner: ownerName,
      ownerEmail,
      isMyProject,
      membersList
    }
  })

  // Filter projects based on activeTab
  const getFilteredProjects = () => {
    const userEmailLower = (user?.email || '').toLowerCase()
    
    if (activeTab === 'public') {
      return allProjects.filter(p => p.visibility.toString().toLowerCase() === 'public')
    }
    if (activeTab === 'shared') {
      // Shared projects are where current user is invited (in memberList) but is not the Owner
      return allProjects.filter(p => {
        const isMember = p.membersList.some((m: any) => m.email.toLowerCase() === userEmailLower)
        const isOwner = p.membersList.some((m: any) => m.email.toLowerCase() === userEmailLower && m.role === 'OWNER')
        return isMember && !isOwner
      })
    }
    // 'my' tab: All projects owned by current user
    return allProjects.filter(p => {
      // Show default mocks only matching owner
      if (p.id.startsWith('mock-') && p.ownerEmail.toLowerCase() !== userEmailLower) {
        return false
      }
      return p.isMyProject
    })
  }

  const displayedProjects = getFilteredProjects()

  // Redirect standard user if trying to access admin
  useEffect(() => {
    if (activeTab === 'admin' && !isAdmin) {
      setActiveTab('my')
    }
  }, [activeTab, isAdmin])

  // Do not flash layout if logged out
  if (!isLoggedIn) {
    return null
  }

  return (
    <div className="flex flex-col h-screen w-full bg-bg-primary text-text-primary overflow-hidden">
      {/* Header Navigation */}
      <header className="h-14 bg-bg-secondary border-b border-border flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-accent rounded flex items-center justify-center font-bold text-white shadow-inner">F</div>
          <h1 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
            Flowdeck 
            <span className="text-[10px] bg-accent/20 text-accent font-semibold px-2 py-0.5 rounded-full border border-accent/30">활성화됨</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span className="text-xs text-text-muted">실시간 소켓 게이트웨이 웹서버 전송 대기중 (Port: 3000)</span>
          </div>
          <div className="h-8 w-[1px] bg-border"></div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold text-white">{user?.name || '개발자'}</span>
              <span className="text-[10px] text-text-muted">{user?.email || 'guest@flowdeck.com'}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 text-xs border border-border rounded hover:bg-bg-tertiary transition-colors text-text-muted hover:text-white font-medium"
            >
              <LogOut size={14} />
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-bg-secondary border-r border-border flex flex-col p-4 shrink-0 justify-between">
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-bold text-text-muted tracking-widest uppercase mb-3 px-3">내비게이션</p>
              <nav className="space-y-1">
                <button 
                  onClick={() => setActiveTab('my')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center gap-3 transition-colors ${
                    activeTab === 'my' 
                      ? 'bg-bg-tertiary text-white shadow-inner border-l-2 border-accent' 
                      : 'text-text-muted hover:bg-bg-tertiary/50 hover:text-white'
                  }`}
                >
                  <List size={18} className={activeTab === 'my' ? 'text-accent' : ''} />
                  내 프로젝트 (My Workspace)
                </button>
                <button 
                  onClick={() => setActiveTab('shared')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center gap-3 transition-colors ${
                    activeTab === 'shared' 
                      ? 'bg-bg-tertiary text-white shadow-inner border-l-2 border-accent' 
                      : 'text-text-muted hover:bg-bg-tertiary/50 hover:text-white'
                  }`}
                >
                  <Users size={18} className={activeTab === 'shared' ? 'text-accent' : ''} />
                  공유받은 프로젝트 (Shared)
                </button>
                <button 
                  onClick={() => setActiveTab('public')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center gap-3 transition-colors ${
                    activeTab === 'public' 
                      ? 'bg-bg-tertiary text-white shadow-inner border-l-2 border-accent' 
                      : 'text-text-muted hover:bg-bg-tertiary/50 hover:text-white'
                  }`}
                >
                  <Globe size={18} className={activeTab === 'public' ? 'text-accent' : ''} />
                  공개 프로젝트 (Public)
                </button>
                <button 
                  onClick={() => setActiveTab('mypage')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center gap-3 transition-colors ${
                    activeTab === 'mypage' 
                      ? 'bg-bg-tertiary text-white shadow-inner border-l-2 border-accent' 
                      : 'text-text-muted hover:bg-bg-tertiary/50 hover:text-white'
                  }`}
                >
                  <User size={18} className={activeTab === 'mypage' ? 'text-accent' : ''} />
                  마이페이지 (My Page)
                </button>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center gap-3 transition-colors ${
                    activeTab === 'settings' 
                      ? 'bg-bg-tertiary text-white shadow-inner border-l-2 border-accent' 
                      : 'text-text-muted hover:bg-bg-tertiary/50 hover:text-white'
                  }`}
                >
                  <Settings size={18} className={activeTab === 'settings' ? 'text-accent' : ''} />
                  IDE 환경 설정 (Settings)
                </button>
              </nav>
            </div>

          </div>
        </aside>

        {/* Main Workspace Area */}
        <main className="flex-1 overflow-y-auto p-10 bg-bg-primary">
          {(activeTab === 'my' || activeTab === 'shared' || activeTab === 'public') && (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-12 md:gap-24 mb-10">
                <div className="max-w-xl">
                  <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
                    {activeTab === 'my' && '내 작업 워크스페이스'}
                    {activeTab === 'shared' && '협업 프로젝트 허브'}
                    {activeTab === 'public' && '공개 프로젝트 디렉토리'}
                  </h2>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {activeTab === 'my' && '코드를 편집하고 실시간 동기화 브릿지를 통해 자유롭게 협업 프로젝트를 설계하고 구축합니다.'}
                    {activeTab === 'shared' && '회원님을 프로젝트 멤버(EDITOR, OWNER)로 등록한 다른 팀원들의 실시간 워크스페이스입니다.'}
                    {activeTab === 'public' && '전체 개발자들에게 공개 설정된 Flowdeck 코드 저장소 목록입니다. 자유롭게 코드를 탐색해보세요.'}
                  </p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-accent text-white rounded-md font-semibold hover:bg-accent-hover transition-all shadow-lg hover:shadow-accent/20 active:scale-95 shrink-0"
                >
                  <Plus size={20} />
                  새 프로젝트 생성
                </button>
              </div>

              {isLoadingProjects ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-text-muted">Flowdeck 게이트웨이 원격 동기화 중...</span>
                </div>
              ) : displayedProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-xl bg-bg-secondary/20 w-full">
                  <p className="text-sm text-text-muted mb-4">현재 카테고리에 속한 프로젝트가 발견되지 않았습니다.</p>
                  <button onClick={() => setIsModalOpen(true)} className="text-xs text-accent font-semibold hover:underline">
                    첫 번째 협업 프로젝트 시작하기 →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {displayedProjects.map((project) => {
                    const userEmailLower = (user?.email || '').toLowerCase()
                    const myMember = project.membersList?.find(
                      (m: any) => m.email.toLowerCase() === userEmailLower
                    )
                    const isPending = myMember?.status === 'PENDING'

                    return (
                      <div 
                        key={project.id} 
                        onClick={() => {
                          if (isPending) {
                            alert('워크스페이스에 진입하기 전에 먼저 초대 승인(수락)을 완료해 주십시오.')
                          } else {
                            navigate(`/projects/${project.id}`)
                          }
                        }}
                        className={`bg-bg-secondary border rounded-xl p-6 transition-all cursor-pointer group flex flex-col shadow-sm hover:shadow-md hover:scale-[1.01] transform duration-150 ${
                          isPending 
                            ? 'border-yellow-600/40 shadow-[0_0_12px_rgba(234,179,8,0.1)] bg-yellow-500/[0.015]' 
                            : 'border-border hover:border-accent'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-10 h-10 bg-bg-tertiary rounded-lg flex items-center justify-center text-xl shadow-inner">
                            {project.icon}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {isPending && (
                              <span className="px-2 py-0.5 bg-yellow-500/15 border border-yellow-500/20 rounded text-[9px] text-yellow-400 uppercase tracking-wider font-semibold animate-pulse">
                                초대 승인 대기
                              </span>
                            )}
                            <span className="px-2 py-0.5 bg-bg-primary border border-border rounded text-[10px] text-text-muted uppercase tracking-wider font-bold">
                              {project.visibility === 'PUBLIC' || project.visibility === 'Public' ? '공동공개' : '프라이빗'}
                            </span>
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-accent transition-colors flex items-center justify-between">
                          {project.title}
                          {!isPending && (
                            <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-accent" />
                          )}
                        </h3>
                        
                        <p className="text-sm text-text-muted flex-1 line-clamp-2 mb-8 leading-relaxed">
                          {project.description}
                        </p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-text-muted uppercase">소유자: <span className="text-white font-medium">{project.owner}</span></span>
                            <span className="text-[9px] text-text-muted mt-0.5">변경 일시: {project.updatedAt}</span>
                          </div>
                          
                          <div className="flex items-center gap-2.5">
                            {/* OWNER options (Modify and Delete) */}
                            {project.isMyProject && !isPending && (
                              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => openEditModal(project)}
                                  title="프로젝트 수정"
                                  className="p-1.5 hover:bg-bg-tertiary hover:text-accent rounded-md text-text-muted border border-transparent hover:border-border transition-all"
                                >
                                  <Edit3 size={13} />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteProject(project.id, e)}
                                  title="프로젝트 삭제"
                                  className="p-1.5 hover:bg-bg-tertiary hover:text-red-400 rounded-md text-text-muted border border-transparent hover:border-border transition-all"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            )}

                            <div className="flex -space-x-2">
                              <div className="w-6 h-6 rounded-full bg-indigo-500 border-2 border-bg-secondary text-[8px] flex items-center justify-center text-white font-bold">MK</div>
                              <div className="w-6 h-6 rounded-full bg-teal-500 border-2 border-bg-secondary text-[8px] flex items-center justify-center text-white font-bold">GN</div>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Acceptance panel for invited users */}
                        {isPending && (
                          <div 
                            className="flex gap-2 mt-4 pt-4 border-t border-border/40" 
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => handleRespondToInvite(project.id, true)}
                              className="flex-1 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg shadow-md hover:shadow-accent/20 transition-all active:scale-[0.97]"
                            >
                              초대 승인
                            </button>
                            <button
                              onClick={() => handleRespondToInvite(project.id, false)}
                              className="flex-1 py-1.5 bg-bg-tertiary hover:bg-neutral-800 text-text-muted hover:text-white text-xs font-semibold rounded-lg border border-border transition-all active:scale-[0.97]"
                            >
                              거절
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  <div 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-transparent border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-text-muted hover:bg-bg-secondary hover:border-accent transition-all cursor-pointer min-h-[200px] group"
                  >
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-border flex items-center justify-center mb-3 group-hover:border-accent group-hover:text-accent transition-all">
                      <Plus size={24} />
                    </div>
                    <span className="text-sm font-medium group-hover:text-white transition-colors">새 협업 프로젝트 구상하기</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 4: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl animate-in fade-in duration-150">
              <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">IDE 환경 설정 및 테마 수정</h2>
              <p className="text-sm text-text-muted mb-10">코드 에디터 서체, 줄 크기 및 기본 구문 강조 옵션을 수정합니다.</p>

              <div className="bg-bg-secondary rounded-xl p-8 border border-border space-y-8">
                <div>
                  <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <Terminal size={18} className="text-accent" />
                    에디터 레이아웃 커스텀
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">기본 구문 강조 테마</label>
                      <select 
                        value={editorTheme} 
                        onChange={(e) => setEditorTheme(e.target.value)}
                        className="w-full rounded-md bg-bg-primary border border-border p-3 text-sm focus:border-accent text-white"
                      >
                        <option value="one-dark">Atom One Dark (추천 최적화 옵션)</option>
                        <option value="monokai">Monokai Retro 다크</option>
                        <option value="dracula">Dracula Dark 특화 테마</option>
                        <option value="github-light">Github 화이트에디션 클래식</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">에디터 폰트 크기 (px)</label>
                      <input 
                        type="number" 
                        value={fontSize} 
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full rounded-md bg-bg-primary border border-border p-3 text-sm focus:border-accent text-white" 
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-8 flex justify-end">
                  <button 
                    onClick={() => {
                      alert('에디터 옵션이 현재 앱 세션 브릿지에 안전하게 저장되었습니다!')
                      setActiveTab('my')
                    }}
                    className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-white rounded font-bold transition-all text-sm"
                  >
                    레이아웃 옵션 적용하기
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4.5: MYPAGE */}
          {activeTab === 'mypage' && (
            <div className="max-w-3xl animate-in fade-in duration-150">
              <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">마이페이지 & 개인 설정</h2>
              <p className="text-sm text-text-muted mb-10">내 프로필 성함을 편집하거나 탈퇴하는 계정 관리 센터입니다.</p>

              <div className="bg-bg-secondary rounded-xl p-8 border border-border space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                    <User size={18} className="text-blue-400" />
                    마이페이지 및 개인 정보 관리
                  </h3>
                  <p className="text-xs text-text-muted mb-6">flowdeck 계정 성함 변경이나 영구 회원 탈퇴 등 가상 세션을 직접 제어할 수 있습니다.</p>

                  <div className="bg-bg-primary/50 rounded-lg p-5 border border-border/60 mb-6 space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-text-muted">가입 이메일</span>
                      <span className="text-white font-mono font-medium">{user?.email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t border-border/40 pt-4">
                      <span className="text-text-muted">권한 레벨</span>
                      <span className="px-2.5 py-0.5 rounded bg-bg-tertiary text-xs font-semibold text-accent border border-border">
                        {user?.email && (user.email === 'admin@flowdeck.io' || user.email.startsWith('admin@')) ? 'SYSTEM ADMIN' : 'WORKSPACE MEMBER'}
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateName} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">가입자 이름 (성함 수정)</label>
                      <div className="flex gap-3">
                        <input 
                          type="text" 
                          required
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="flex-1 rounded-md bg-bg-primary border border-border p-3 text-sm focus:border-accent text-white" 
                          placeholder="수정할 성함 입력"
                        />
                        <button 
                          type="submit" 
                          className="px-5 py-3 bg-accent hover:bg-accent-hover text-white rounded font-bold transition-all text-sm shadow-md"
                        >
                          성함 수정 저장
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                <div className="border-t border-border pt-6">
                  <h4 className="text-sm font-bold text-red-500 mb-2">위험 구역 (Danger Zone)</h4>
                  <p className="text-xs text-text-muted mb-4">현재 로그인된 회원 정보를 flowdeck 사이트 전체 회원 풀 및 데이터베이스에서 즉각 제거합니다. 탈퇴 시 모든 프로젝트 및 가상 디렉토리가 파괴됩니다.</p>
                  <button 
                    onClick={handleDeleteAccount}
                    className="px-4 py-2.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/50 hover:border-red-500 rounded font-bold transition-all text-xs"
                  >
                    회원 영구 탈퇴 처리 및 세션 분쇄
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Bottom Status Bar */}
      <footer className="h-6 bg-accent text-white flex items-center justify-between px-3 shrink-0 text-[11px] font-medium shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 cursor-pointer hover:bg-white/10 px-2 rounded h-full transition-colors">
            <span>⎇ main*</span>
          </div>
          <div className="flex items-center gap-1 cursor-pointer hover:bg-white/10 px-2 rounded h-full transition-colors">
            <span>⟳ 동기화 완료</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 px-2">
            <Terminal size={12} />
            <span>Go / React Stack</span>
          </div>
          <span className="px-2">UTF-8</span>
          <span className="px-2 border-l border-white/20">Ln 1, Col 1</span>
        </div>
      </footer>

      {/* Modal - Elegant Dark Style */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-bg-secondary p-8 shadow-2xl border border-border animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white tracking-tight">새 프로젝트 생성</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            {error && (
              <div className="mb-4 p-3 rounded bg-red-950/40 border border-red-900/50 text-red-400 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">프로젝트 이름</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-md bg-bg-primary border border-border p-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none text-white transition-all placeholder:text-bg-tertiary"
                  placeholder="예: 실시간 채팅 백엔드 모듈" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">공개 범위 설정</label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as 'PUBLIC' | 'PRIVATE')}
                  className="w-full rounded-md bg-[#1e1e24] border border-[#2b2b35] p-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none text-white transition-all"
                >
                  <option value="PRIVATE">프라이빗 (비공개)</option>
                  <option value="PUBLIC">공동공개 (Public)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">팀원 초대 <span className="font-normal lowercase opacity-60">(선택 사항)</span></label>
                <textarea 
                  value={invitedEmailsStr}
                  onChange={(e) => setInvitedEmailsStr(e.target.value)}
                  className="w-full rounded-md bg-bg-primary border border-border p-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none text-white h-20 transition-all resize-none placeholder:text-bg-tertiary"
                  placeholder="초대할 동료의 이메일을 쉼표(,)나 줄바꿈으로 입력하십시오. (예: minkyung@flowdeck.io, gyuna@flowdeck.io)" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">프로젝트 목표 설명 <span className="font-normal lowercase opacity-60">(선택 사항)</span></label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md bg-bg-primary border border-border p-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none text-white h-24 transition-all resize-none placeholder:text-bg-tertiary"
                  placeholder="프로젝트의 아키텍처나 핵심 요구사항을 입력하세요." 
                />
              </div>
              
              <div className="flex gap-3 pt-6">
                <button 
                  type="button"
                  disabled={isCreating}
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-md bg-bg-tertiary py-3 font-semibold text-sm hover:bg-[#3e3e42] transition-colors border border-border disabled:opacity-50"
                >
                  취소
                </button>
                <button 
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 rounded-md bg-accent py-3 font-semibold text-sm text-white hover:bg-accent-hover transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {isCreating ? '생성 중...' : '프로젝트 개설'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-bg-secondary p-8 shadow-2xl border border-border animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white tracking-tight">프로젝트 정보 수정</h2>
              <button 
                onClick={() => {
                  setIsEditModalOpen(false)
                  setEditingProjectId(null)
                }} 
                className="text-text-muted hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateProject} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">프로젝트 이름</label>
                <input 
                  type="text" 
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-md bg-bg-primary border border-border p-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none text-white transition-all placeholder:text-bg-tertiary"
                  placeholder="예: 실시간 채팅 백엔드 모듈" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">공개 범위 설정 설정</label>
                <select
                  value={editVisibility}
                  onChange={(e) => setEditVisibility(e.target.value as 'PUBLIC' | 'PRIVATE')}
                  className="w-full rounded-md bg-bg-primary border border-border p-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none text-white transition-all"
                >
                  <option value="PRIVATE">프라이빗 (비공개)</option>
                  <option value="PUBLIC">공동공개 (Public)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">프로젝트 목표 설명 <span className="font-normal lowercase opacity-60">(선택 사항)</span></label>
                <textarea 
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-md bg-bg-primary border border-border p-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none text-white h-24 transition-all resize-none placeholder:text-bg-tertiary"
                  placeholder="프로젝트의 아키텍처나 핵심 요구사항을 입력하세요." 
                />
              </div>
              
              <div className="flex gap-3 pt-6">
                <button 
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setEditingProjectId(null)
                  }}
                  className="flex-1 rounded-md bg-bg-tertiary py-3 font-semibold text-sm hover:bg-[#3e3e42] transition-colors border border-border"
                >
                  취소
                </button>
                <button 
                  type="submit"
                  className="flex-1 rounded-md bg-accent py-3 font-semibold text-sm text-white hover:bg-accent-hover transition-all shadow-lg active:scale-95"
                >
                  수정 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
