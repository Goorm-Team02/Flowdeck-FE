import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Users, ShieldAlert, Code2, AlertTriangle } from "lucide-react";
import { projectService } from "../../features/auth/api/customApi";
import type { Project, ProjectMember } from "../../features/auth/authTypes";
import { useAuthStore } from "../../features/auth/authStore";

export default function WorkspacePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isLoggedIn, isLoading: isAuthLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      navigate("/login");
    }
  }, [isAuthLoading, isLoggedIn, navigate]);

  const loadWorkspaceData = async () => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch project list and match target id
      const list = await projectService.getPublicProjects();
      const matched = list.find(p => p.id === projectId);
      
      if (matched) {
        setProject(matched);
        // 2. Fetch truly connected members from real backend API
        const memberList = await projectService.getProjectMembers(projectId);
        setMembers(memberList);
      } else {
        setError("해당 워크스페이스 프로젝트를 찾을 수 없거나 접근 자격이 부재합니다.");
      }
    } catch (err: any) {
      console.error("Workspace load failure", err);
      setError(err.message || "워크스페이스 로깅 중 에러가 유출되었습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaceData();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen w-full bg-zinc-950 items-center justify-center p-6 text-zinc-100">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-zinc-400 mt-4 font-sans font-medium">실시간 IDE 동기화 가상 노드 포트 매핑 중개 중...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col min-h-screen w-full bg-zinc-950 items-center justify-center p-6 text-zinc-100">
        <div className="max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center shadow-xl">
          <AlertTriangle className="text-amber-500 mx-auto mb-4" size={32} />
          <h2 className="text-lg font-bold text-white mb-2">접근 유효성 감지 실패</h2>
          <p className="text-xs text-zinc-400 mb-6 leading-relaxed bg-zinc-950 p-3 rounded border border-zinc-800 font-mono">{error}</p>
          <Link 
            to="/" 
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold transition-all inline-block"
          >
            내 작업공간 목록으로 복귀
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div id="workspace_viewport" className="flex flex-col min-h-screen w-full bg-zinc-950 text-zinc-100 font-sans items-center justify-center p-4 sm:p-12">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-850 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        
        {/* Decorative background ambient neon shine */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors group cursor-pointer"
          >
            <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
            내 작업공간 목록으로 돌아가기
          </Link>
        </div>

        {/* Project Header Card */}
        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 bg-indigo-600/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 shrink-0">
            <Code2 size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{project.title}</h1>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-semibold px-2 py-0.5 rounded border border-indigo-500/20">
                Active ID: {project.id}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
              {project.description || "성공적으로 창포된 최적화된 협업 디렉토리 프로젝트입니다."}
            </p>
          </div>
        </div>

        {/* Allocation Notice Box (Simplified) */}
        <div className="p-4.5 rounded-xl bg-zinc-950 border border-zinc-850 flex items-start gap-3.5 mb-8">
          <div className="p-1.5 rounded bg-amber-500/10 text-amber-500 shrink-0 mt-0.5">
            <ShieldAlert size={14} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">가상 IDE 노드 동화 완료</p>
            <p className="text-xs text-zinc-500 leading-relaxed mt-1">
              본 프로젝트는 STOMP 인터페이스 및 가상 소켓 스트리밍 환경 구축이 완료된 실제 백엔드 소켓 공간입니다.
              동기화 파트너들과 함께 신속하게 협업 로직을 갱신해 보세요.
            </p>
          </div>
        </div>

        {/* Invited Collaborators Section */}
        <div className="border-t border-zinc-850 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Users size={15} className="text-indigo-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">최종 동기화된 팀원 조인 목록 ({members.length})</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {members.length === 0 ? (
              <p className="text-xs text-zinc-500">초대된 팀원이 없습니다.</p>
            ) : (
              members.map((m) => (
                <div 
                  key={m.id} 
                  className="p-3 bg-zinc-950/80 rounded-lg border border-zinc-850 flex items-center justify-between hover:border-indigo-500/40 transition-all"
                >
                  <div className="truncate pr-2">
                    <p className="text-xs font-medium text-white truncate">{m.name}</p>
                    <p className="text-[10px] text-zinc-500 truncate mt-0.5">{m.email}</p>
                  </div>
                  <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border shrink-0 ${
                    m.role === "OWNER" 
                      ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" 
                      : m.status === "PENDING"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.05)]"
                      : "bg-zinc-900 text-zinc-400 border-zinc-800"
                  }`}>
                    {m.role === "OWNER" ? "소유자" : m.status === "PENDING" ? "초대 대기중" : "참여자"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer controls */}
        <div className="mt-8 pt-6 border-t border-zinc-850 flex flex-col sm:flex-row gap-3 justify-end">
          <button 
            onClick={() => loadWorkspaceData()}
            className="px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-xs font-semibold text-zinc-300 transition-all border border-zinc-700 cursor-pointer text-center"
          >
            실시간 멤버 갱신(Refresh)
          </button>
          <Link 
            to="/"
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all text-center block"
          >
            대시보드 목록으로 복귀
          </Link>
        </div>

      </div>
    </div>
  );
}
