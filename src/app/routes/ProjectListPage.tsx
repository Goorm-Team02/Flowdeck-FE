import { 
  Plus, List, X, Settings, Globe, LogOut, Terminal, 
  ArrowUpRight, Edit3, Trash2, User, Check, AlertCircle
} from "lucide-react";
import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAtom } from 'jotai'

import { useAuthStore } from '@/features/auth/authStore'
import { projectService } from '@/features/auth/api/customApi'
import type { Project, ProjectMember } from '@/features/auth/authTypes'
import { THEMES, applyTheme, getStoredTheme } from '@/shared/lib/theme'
import type { ThemeName } from '@/shared/lib/theme'
import { editorSettingsAtom } from '@/shared/stores/editorSettingsAtom'

type TabType = "my" | "public" | "mypage" | "settings";

interface RichProject extends Project {
  members: ProjectMember[];
  ownerName: string;
  ownerEmail: string;
  isMyProject: boolean;
  statusForMe: "ACCEPTED" | "PENDING" | "NONE";
}

export default function ProjectListPage() {
  const [activeTab, setActiveTab] = useState<TabType>("my");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Create project form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PRIVATE");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit project states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editVisibility, setEditVisibility] = useState<"PUBLIC" | "PRIVATE">("PRIVATE");

  // Server state projects
  const [richProjects, setRichProjects] = useState<RichProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // User Profile
  const { user, isLoggedIn, logout, updateProfile, deleteAccount } = useAuthStore();
  const [profileName, setProfileName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  const [editorTheme, setEditorTheme] = useState<ThemeName>(() => getStoredTheme());
  const [editorSettings, setEditorSettings] = useAtom(editorSettingsAtom);

  const handleThemeChange = (theme: ThemeName) => {
    setEditorTheme(theme)
    applyTheme(theme)
    setEditorSettings(prev => ({ ...prev, monacoTheme: theme }))
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    } else if (user?.name) {
      setProfileName(user.name);
    }
  }, [isLoggedIn, user, navigate]);

  // Load All Projects along with their Member structures
  const syncServerProjects = async () => {
    if (!isLoggedIn || !user) return;
    if (activeTab === 'mypage' || activeTab === 'settings') return;
    setIsLoading(true);
    try {
      // 1. Fetch projects by tab type
      const baseProjects = activeTab === 'public'
        ? await projectService.getPublicProjects()
        : await projectService.getMyProjects();

      // 2. 프로젝트 데이터만으로 RichProject 구성 (멤버 API 불필요)
      const wrapped: RichProject[] = baseProjects.map((proj) => ({
        ...proj,
        members: [],
        ownerName: "",
        ownerEmail: "",
        isMyProject: activeTab !== 'public',
        statusForMe: "NONE" as const,
      }));

      setRichProjects(wrapped);
    } catch (err) {
      console.error("Failed to sync server projects", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    syncServerProjects();
  }, [isLoggedIn, activeTab]);

  const handleUpdateName = async (e: FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;
    setIsSavingName(true);
    try {
      await updateProfile(profileName.trim());
      alert("사용자 정보(이름)가 성공적으로 변경되었습니다!");
    } catch (err: any) {
      alert(err.message || "이름 변경에 실패했습니다.");
    } finally {
      setIsSavingName(false);
    }
  };

  const handleDeleteAccount = async () => {
    const doubleConfirm = window.confirm(
      "정말 회원 탈퇴를 처리하시겠습니까?\n모든 프로젝트 참여 내역 및 워크스페이스 세션 일체가 완전히 파괴됩니다."
    );
    if (!doubleConfirm) return;
    try {
      await deleteAccount();
      alert("회원 탈퇴 처리가 완료되었습니다.");
      navigate("/login");
    } catch (err: any) {
      alert(err.message || "회원 탈퇴 처리 실패.");
    }
  };

  // Create Project Callback
  const handleCreateProject = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setError(null);
    setIsCreating(true);

    try {
      await projectService.createProject({
        title,
        visibility,
        description,
      });

      await syncServerProjects();
      setIsModalOpen(false);
      // Reset form
      setTitle("");
      setDescription("");
      setVisibility("PRIVATE");
      alert("프로젝트가 성공적으로 창설되었습니다!");
    } catch (err: any) {
      console.error("Failed to create project:", err);
      setError(err.message || "프로젝트 생성에 실패하였습니다. 다시 시도해주세요.");
    } finally {
      setIsCreating(false);
    }
  };

  // Accept / Reject Invitation Response
  const handleRespondToInvite = async (projectId: string, accept: boolean, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering card click
    const actionStr = accept ? "승인(수락)" : "거절";
    if (!window.confirm(`이 프로젝트의 초대를 정말 ${actionStr}하시겠습니까?`)) return;

    try {
      await projectService.respondToInvitation(projectId, accept);
      alert(`초대를 성공적으로 ${actionStr} 처리했습니다.`);
      await syncServerProjects();
    } catch (err: any) {
      alert(err.message || "초대 처리 중 오류가 발생했습니다.");
    }
  };

  // Update Project Info
  const openEditModal = (project: RichProject, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProjectId(project.id);
    setEditTitle(project.title);
    setEditDescription(project.description || "");
    setEditVisibility(project.visibility);
    setIsEditModalOpen(true);
  };

  const handleUpdateProject = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingProjectId || !editTitle.trim()) return;
    try {
      await projectService.updateProject(editingProjectId, {
        title: editTitle,
        description: editDescription,
        visibility: editVisibility,
      });
      setIsEditModalOpen(false);
      setEditingProjectId(null);
      alert("프로젝트 설정이 안전하게 수립되었습니다!");
      await syncServerProjects();
    } catch (err: any) {
      alert(err.message || "프로젝트 수정 실패.");
    }
  };

  // Delete Project Callback
  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("정말 이 프로젝트를 영구적으로 완전히 삭제하시겠습니까? 연관 멤버 매핑과 세션 일체가 완전히 삭제됩니다.")) return;
    try {
      await projectService.deleteProject(projectId);
      alert("프로젝트가 완벽히 파기되었습니다.");
      await syncServerProjects();
    } catch (err: any) {
      alert(err.message || "프로젝트 삭제 실패.");
    }
  };

  // Click on Project Card -> Redirect or Alert if Pending
  const handleCardClick = (project: RichProject) => {
    if (project.statusForMe === "PENDING") {
      alert("워크스페이스에 진입하기 전에 먼저 하단의 초대 승인(수락)을 완료해 주셔야 합니다.");
      return;
    }
    navigate(`/projects/${project.id}`);
  };

  // Tab Filtering logic
  const getFilteredProjects = () => {
    if (!user) return [];
    
    if (activeTab === "public") {
      // All PUBLIC projects
      return richProjects.filter(p => p.visibility === "PUBLIC");
    }
    // "my" tab -> User is Owner of the project
    return richProjects.filter(p => p.isMyProject);
  };

  const displayedProjects = getFilteredProjects();

  return (
    <div className="flex flex-col h-screen w-full bg-bg-deep text-text-primary overflow-hidden font-sans">
      {/* Top Header */}
      <header id="app_header" className="h-14 bg-bg-secondary border-b border-border flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Flowdeck" className="w-8 h-8" />
          <h1 className="text-lg font-semibold tracking-tight text-text-primary flex items-center gap-2">
            Flowdeck 
            <span className="text-[10px] bg-accent/20 text-accent font-semibold px-2 py-0.5 rounded-full border border-accent/30">
              네트워크 온라인
            </span>
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
            <span className="text-xs text-text-muted">실시간 데이터베이스 결합 엔진 활성화 (Port: 3000)</span>
          </div>
          <div className="h-8 w-[1px] bg-bg-tertiary"></div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold text-text-primary">{user?.name}</span>
              <span className="text-[10px] text-text-muted">{user?.email}</span>
            </div>
            <button 
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-xs border border-border rounded hover:bg-bg-tertiary transition-colors text-text-muted hover:text-text-primary font-medium cursor-pointer"
            >
              <LogOut size={13} />
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* Main Body Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Nav */}
        <aside id="sidebar_nav" className="w-64 bg-bg-secondary border-r border-border flex flex-col p-4 shrink-0 justify-between">
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-bold text-text-muted/70 tracking-widest uppercase mb-3 px-3">협업 공간 디렉토리</p>
              <nav className="space-y-1">
                <button 
                  onClick={() => setActiveTab("my")}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center gap-3 transition-colors cursor-pointer ${
                    activeTab === "my" 
                      ? "bg-bg-tertiary text-text-primary border-l-2 border-accent" 
                      : "text-text-muted hover:bg-bg-tertiary/40 hover:text-text-primary"
                  }`}
                >
                  <List size={16} className={activeTab === "my" ? "text-accent" : ""} />
                  내 프로젝트 (My Workspace)
                </button>
                <button
                  onClick={() => setActiveTab("public")}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center gap-3 transition-colors cursor-pointer ${
                    activeTab === "public" 
                      ? "bg-bg-tertiary text-text-primary border-l-2 border-accent" 
                      : "text-text-muted hover:bg-bg-tertiary/40 hover:text-text-primary"
                  }`}
                >
                  <Globe size={16} className={activeTab === "public" ? "text-accent" : ""} />
                  공개 프로젝트 (Public)
                </button>
                <button 
                  onClick={() => setActiveTab("mypage")}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center gap-3 transition-colors cursor-pointer ${
                    activeTab === "mypage" 
                      ? "bg-bg-tertiary text-text-primary border-l-2 border-accent" 
                      : "text-text-muted hover:bg-bg-tertiary/40 hover:text-text-primary"
                  }`}
                >
                  <User size={16} className={activeTab === "mypage" ? "text-accent" : ""} />
                  마이페이지 (My Page)
                </button>
                <button 
                  onClick={() => setActiveTab("settings")}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center gap-3 transition-colors cursor-pointer ${
                    activeTab === "settings" 
                      ? "bg-bg-tertiary text-text-primary border-l-2 border-accent" 
                      : "text-text-muted hover:bg-bg-tertiary/40 hover:text-text-primary"
                  }`}
                >
                  <Settings size={16} className={activeTab === "settings" ? "text-accent" : ""} />
                  IDE 환경 설정 (Settings)
                </button>
              </nav>
            </div>
          </div>
          <div className="p-3 bg-bg-deep/80 rounded-lg border border-border/80 text-[11px] text-text-muted/70">
            <p className="font-semibold text-text-primary/70">💡 정보 안내</p>
            <p className="mt-1 leading-relaxed">서버의 인메모리 DB를 탐색 중이므로 본 데모상 모든 수정/생성/삭제가 백엔드에 다이렉트로 반영됩니다.</p>
          </div>
        </aside>

        {/* Dashboard Work Area */}
        <main className="flex-1 overflow-y-auto p-8 lg:p-10 bg-bg-deep">
          {(activeTab === "my" || activeTab === "public") && (
            <>
              {/* Hero Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-border/50">
                <div className="max-w-xl">
                  <h2 className="text-2xl font-bold text-text-primary mb-2 tracking-tight">
                    {activeTab === "my" && "내 협업 워크스페이스"}
                    {activeTab === "public" && "공개 프로젝트 디렉토리"}
                  </h2>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {activeTab === "my" && "서버단에 실시간 동기화되는 나만의 단독 저장소 공간을 구성하고 관리합니다."}
                    {activeTab === "public" && "Flowdeck 네트워크 환경 전체 구성원들에게 자유롭게 개방된 오픈소스 모듈 목록입니다."}
                  </p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-accent text-text-primary rounded-md font-semibold hover:bg-accent/85 transition-all shadow-lg shadow-accent/10 active:scale-95 shrink-0 cursor-pointer"
                >
                  <Plus size={18} />
                  새 프로젝트 생성
                </button>
              </div>

              {/* Loader */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                  <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-text-muted font-medium">Flowdeck 데이터베이스 연결 및 위빙 중...</span>
                </div>
              ) : displayedProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-xl bg-bg-secondary/10 w-full text-center">
                  <AlertCircle size={24} className="text-text-muted/50 mb-3" />
                  <p className="text-sm text-text-muted mb-4">해당 카테고리에 할당된 프로젝트가 발견되지 않았습니다.</p>
                  <button onClick={() => setIsModalOpen(true)} className="text-xs text-accent font-semibold hover:underline cursor-pointer">
                    프로젝트 추가 생성으로 시작해보기 →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {displayedProjects.map((project) => {
                    const isPending = project.statusForMe === "PENDING";

                    return (
                      <div 
                        key={project.id} 
                        onClick={() => handleCardClick(project)}
                        className={`bg-bg-secondary border rounded-xl p-6 transition-all cursor-pointer group flex flex-col shadow-lg hover:scale-[1.01] transform duration-150 relative ${
                          isPending 
                            ? "border-amber-600/40 shadow-[0_0_12px_rgba(245,158,11,0.08)] bg-amber-500/[0.01]" 
                            : "border-border hover:border-accent"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-10 h-10 bg-bg-deep rounded-lg flex items-center justify-center text-xl shadow-inner border border-border">
                            {project.visibility === "PUBLIC" ? "🌐" : "🔒"}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {isPending && (
                              <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[9px] text-amber-400 font-bold uppercase tracking-wider animate-pulse">
                                초대 승인 대기
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-accent transition-colors flex items-center justify-between">
                          {project.title}
                          {!isPending && (
                            <ArrowUpRight size={15} className="opacity-0 group-hover:opacity-100 transition-opacity text-accent" />
                          )}
                        </h3>
                        
                        <p className="text-sm text-text-muted flex-1 line-clamp-2 mb-6 leading-relaxed">
                          {project.description || "이 프로젝트에는 설명이 없습니다."}
                        </p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-border mt-auto text-xs">
                          <span className={`text-[10px] px-2 py-1 rounded border font-medium ${
                            project.visibility === 'PUBLIC'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-bg-deep text-text-muted/70 border-border'
                          }`}>
                            {project.visibility === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE'}
                          </span>

                          <div className="flex items-center gap-2.5">
                            {project.isMyProject && (
                              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={(e) => openEditModal(project, e)}
                                  title="프로젝트 설정"
                                  className="p-1.5 hover:bg-bg-tertiary hover:text-accent rounded-md text-text-muted border border-transparent hover:border-border/60 transition-all cursor-pointer"
                                >
                                  <Edit3 size={13} />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteProject(project.id, e)}
                                  title="프로젝트 삭제"
                                  className="p-1.5 hover:bg-bg-tertiary hover:text-red-400 rounded-md text-text-muted border border-transparent hover:border-border/60 transition-all cursor-pointer"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Interactive Acceptance block for pending invitation */}
                        {isPending && (
                          <div 
                            className="flex gap-2 mt-4 pt-4 border-t border-border/80" 
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={(e) => handleRespondToInvite(project.id, true, e)}
                              className="flex-1 py-1.5 bg-accent hover:bg-accent/85 text-text-primary text-xs font-semibold rounded-lg shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                            >
                              <Check size={12} />
                              초대 승인(수락)
                            </button>
                            <button
                              onClick={(e) => handleRespondToInvite(project.id, false, e)}
                              className="flex-1 py-1.5 bg-bg-tertiary hover:bg-bg-tertiary/80 text-text-muted hover:text-text-primary text-xs font-semibold rounded-lg border border-border/60 transition-all active:scale-95 cursor-pointer"
                            >
                              거절
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-transparent border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-text-muted/70 hover:bg-bg-secondary/30 hover:border-accent transition-all cursor-pointer min-h-[190px] group"
                  >
                    <div className="w-10 h-10 rounded-full border border-dashed border-border/60 flex items-center justify-center mb-3 group-hover:border-accent group-hover:text-accent transition-all">
                      <Plus size={20} />
                    </div>
                    <span className="text-sm font-medium group-hover:text-text-primary transition-colors">새 협업 프로젝트 구상 및 추가</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 4: MY PAGE */}
          {activeTab === "mypage" && (
            <div className="max-w-2xl bg-bg-secondary rounded-xl p-8 border border-border shadow-xl">
              <h2 className="text-xl font-bold text-text-primary mb-2 tracking-tight flex items-center gap-2">
                <User size={20} className="text-accent" />
                마이페이지 (프로필 제어 콘솔)
              </h2>
              <p className="text-xs text-text-muted mb-6">시스템의 로컬 계정 설정 상태와 실시간 데이터베이스 위빙 정보를 처리합니다.</p>

              <form onSubmit={handleUpdateName} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">활성 계정 (이메일)</label>
                  <input 
                    type="text" 
                    disabled 
                    value={user?.email || ""} 
                    className="w-full rounded-md bg-bg-deep border border-border p-3 text-sm text-text-muted/70 cursor-not-allowed outline-none"
                  />
                  <span className="text-[10px] text-text-muted/70 mt-1 block">계정 이메일은 변경이 불가합니다.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">사용자 닉네임 / 성명</label>
                  <input 
                    type="text" 
                    required 
                    value={profileName} 
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full rounded-md bg-bg-deep border border-border p-3 text-sm text-text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                  />
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={isSavingName || !profileName.trim()}
                    className="px-5 py-2.5 bg-accent hover:bg-accent/85 text-text-primary rounded font-bold text-xs cursor-pointer shadow transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {isSavingName ? "서버 저장 중..." : "실시간 이름 수정 적용"}
                  </button>
                </div>
              </form>

              <div className="border-t border-border mt-8 pt-6 space-y-4">
                <p className="text-xs font-bold text-red-400 uppercase tracking-widest">🚨 계정 폐기(회원 탈퇴)</p>
                <p className="text-xs text-text-muted leading-relaxed">
                  회원 탈퇴 처리 시 서버 시스템 내 잔여된 모든 프로젝트 협업 매업 데이터가 파기 처리되며, 연관 기록은 즉시 말소됩니다.
                </p>
                <button 
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-950/40 hover:bg-red-950/80 text-red-400 border border-red-900/60 hover:border-red-500 rounded text-xs font-bold cursor-pointer transition-colors"
                >
                  위험: Flowdeck 계정 영구 말소
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === "settings" && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h2 className="text-xl font-bold text-text-primary mb-1 tracking-tight flex items-center gap-2">
                  <Terminal size={20} className="text-accent" />
                  IDE 환경 설정
                </h2>
                <p className="text-xs text-text-muted">앱 전체에 적용되는 색상 테마와 에디터 서체 크기를 설정합니다.</p>
              </div>

              {/* 테마 선택 카드 */}
              <div className="bg-bg-secondary rounded-xl p-6 border border-border">
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-4">색상 테마</label>
                <div className="grid grid-cols-3 gap-3">
                  {(Object.entries(THEMES) as [ThemeName, typeof THEMES[ThemeName]][]).map(([key, theme]) => (
                    <button
                      key={key}
                      onClick={() => handleThemeChange(key)}
                      className={`rounded-lg border-2 overflow-hidden transition-all cursor-pointer text-left ${
                        editorTheme === key
                          ? 'border-accent shadow-[0_0_0_1px_var(--color-accent)]'
                          : 'border-border hover:border-border/80'
                      }`}
                    >
                      {/* 미리보기 */}
                      <div className="h-14 flex" style={{ background: theme.preview.bg }}>
                        <div className="w-1/3 h-full" style={{ background: theme.preview.panel }} />
                        <div className="flex-1 flex flex-col justify-center gap-1 px-2">
                          <div className="h-1.5 w-3/4 rounded-full" style={{ background: theme.preview.accent }} />
                          <div className="h-1 w-1/2 rounded-full opacity-40" style={{ background: theme.preview.accent }} />
                          <div className="h-1 w-2/3 rounded-full opacity-20" style={{ background: '#ffffff' }} />
                        </div>
                      </div>
                      {/* 이름 */}
                      <div className="px-3 py-2 bg-bg-tertiary">
                        <p className={`text-[11px] font-semibold ${editorTheme === key ? 'text-accent' : 'text-text-primary/70'}`}>
                          {theme.label}
                          {editorTheme === key && ' ✓'}
                        </p>
                        <p className="text-[10px] text-text-muted/70 mt-0.5">{theme.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 폰트 크기 */}
              <div className="bg-bg-secondary rounded-xl p-6 border border-border">
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-3">에디터 폰트 크기 (px)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={11}
                    max={20}
                    value={editorSettings.fontSize}
                    onChange={(e) => setEditorSettings(prev => ({ ...prev, fontSize: Number(e.target.value) }))}
                    className="flex-1 accent-[var(--color-accent)]"
                  />
                  <span className="text-sm font-mono text-text-primary w-8 text-right">{editorSettings.fontSize}</span>
                </div>
                <p className="text-[10px] text-text-muted/60 mt-2">워크스페이스 에디터 반영은 다음 파일 오픈 시 적용됩니다.</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* CREATE DIALOG MODAL */}
      {isModalOpen && (
        <div id="create_project_modal" className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-bg-secondary border border-border rounded-xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-text-primary mb-2">새 협업 프로젝트 창설</h3>
            <p className="text-xs text-text-muted mb-6">진짜 원격 메모리 서버에 신규 작업공간 데이터를 작성하고 초대 팀원을 설정합니다.</p>

            {error && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-900/50 text-red-400 text-xs font-semibold rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">프로젝트 명칭 *</label>
                <input 
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-md bg-bg-deep border border-border p-3 text-xs text-text-primary focus:border-accent outline-none"
                  placeholder="예: API-Gateway-Refactor"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">설명 및 세부 가이드</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-md bg-bg-deep border border-border p-3 text-xs text-text-primary focus:border-accent outline-none resize-none"
                  placeholder="협업을 공유하며 팀원들이 참고할 세부 개요를 서술해 주세요."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">보안 설정</label>
                <div className="flex gap-4">
                  <label className="flex-1 p-3 bg-bg-deep rounded-lg border border-border flex items-center justify-between cursor-pointer hover:border-border/60 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🔒 프라이빗</span>
                    </div>
                    <input 
                      type="radio" 
                      name="visibility" 
                      checked={visibility === "PRIVATE"}
                      onChange={() => setVisibility("PRIVATE")}
                      className="accent-[var(--color-accent)]" 
                    />
                  </label>
                  <label className="flex-1 p-3 bg-bg-deep rounded-lg border border-border flex items-center justify-between cursor-pointer hover:border-border/60 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🌐 퍼블릭 공개</span>
                    </div>
                    <input 
                      type="radio" 
                      name="visibility" 
                      checked={visibility === "PUBLIC"}
                      onChange={() => setVisibility("PUBLIC")}
                      className="accent-[var(--color-accent)]" 
                    />
                  </label>
                </div>
              </div>

<div className="pt-4 border-t border-border flex justify-end gap-3 text-xs">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button 
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2.5 rounded bg-accent hover:bg-accent/85 text-text-primary font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isCreating ? "창설 서버 전송 중..." : "새 프로젝트 생성 완료"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TITLE/DESC MODAL */}
      {isEditModalOpen && (
        <div id="edit_project_modal" className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-bg-secondary border border-border rounded-xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingProjectId(null);
              }}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-text-primary mb-2">프로젝트 설정 수정</h3>
            <p className="text-xs text-text-muted mb-6">창설주 권한으로 지정된 워크스페이스의 정보를 수정 및 연동 변경합니다.</p>

            <form onSubmit={handleUpdateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">프로젝트 명칭</label>
                <input 
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-md bg-bg-deep border border-border p-3 text-xs text-text-primary focus:border-accent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">설명 및 세부 가이드</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-md bg-bg-deep border border-border p-3 text-xs text-text-primary focus:border-accent outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">공개 범위 설정</label>
                <div className="flex gap-4">
                  <label className="flex-1 p-3 bg-bg-deep rounded-lg border border-border flex items-center justify-between cursor-pointer hover:border-border/60 transition-colors">
                    <span className="text-xs">🔒 프라이빗</span>
                    <input 
                      type="radio" 
                      name="edit-visibility" 
                      checked={editVisibility === "PRIVATE"}
                      onChange={() => setEditVisibility("PRIVATE")}
                      className="accent-[var(--color-accent)]" 
                    />
                  </label>
                  <label className="flex-1 p-3 bg-bg-deep rounded-lg border border-border flex items-center justify-between cursor-pointer hover:border-border/60 transition-colors">
                    <span className="text-xs">🌐 퍼블릭</span>
                    <input 
                      type="radio" 
                      name="edit-visibility" 
                      checked={editVisibility === "PUBLIC"}
                      onChange={() => setEditVisibility("PUBLIC")}
                      className="accent-[var(--color-accent)]" 
                    />
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3 text-xs">
                <button 
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingProjectId(null);
                  }}
                  className="px-4 py-2 rounded bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 rounded bg-accent hover:bg-accent/85 text-text-primary font-bold transition-all cursor-pointer"
                >
                  설정 저장 적용
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
