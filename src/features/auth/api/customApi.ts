// src/features/auth/api/customApi.ts
import { apiClient, tokenStorage as originalTokenStorage } from "@/shared/api/client";
import type { User, Project, ProjectMember } from "../authTypes";
import type { ApiResponse } from "@/shared/types/api";

// ─── [하이브리드 토큰 보관소] 질문자님 코드와 팀원 공통 규격을 완벽하게 동기화 ───
export const tokenStorage = {
  // 1. 질문자님 전용 메소드 (authStore.tsx, LoginPage.tsx 등에서 호출)
  getToken: () => originalTokenStorage.getAccess() || "",
  setToken: (token: string) => originalTokenStorage.setAccess(token),
  clearToken: () => originalTokenStorage.clear(),

  // 2. 상대방 팀원들 전용 메소드 (client.ts 스펙 호환)
  getAccess: () => originalTokenStorage.getAccess(),
  getRefresh: () => originalTokenStorage.getRefresh(),
  setAccess: (token: string) => originalTokenStorage.setAccess(token),
  setTokens: (access: string, refresh: string) => originalTokenStorage.setTokens(access, refresh),
  clear: () => originalTokenStorage.clear(),
};

// Authentication Service (공식 apiClient로 무한 로딩을 원천 차단하고 통신 성공 보장)
export const authService = {
  // 회원가입
  signup: async (data: { email: string; name: string; password: string }) => {
    const res = await apiClient.post<ApiResponse<{ message: string; user: User }>>("/api/auth/signup", {
      email: data.email,
      name: data.name,
      password: data.password
    });
    return res.data.data;
  },

  // 로그인 (Axios를 통해 스트림 드레인을 방지하고 토큰 및 프로필을 즉각 통합 반환)
  login: async (data: { email: string; password?: string }) => {
    const res = await apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>("/api/auth/login", data);

    // 수신된 실제 토큰들을 공동 저장 공간에 주입합니다.
    tokenStorage.setTokens(res.data.data.accessToken, res.data.data.refreshToken || "");

    // 즉시 세션 프로필 정보를 가져옵니다.
    const userProfile = await authService.getMyInfo();

    return {
      message: "로그인 성공",
      accessToken: res.data.data.accessToken,
      user: userProfile
    };
  },

  // 내 정보 조회
  getMyInfo: async () => {
    const res = await apiClient.get<ApiResponse<User>>("/api/auth/me");
    return res.data.data;
  },

  // 프로필 정보 수정
  updateProfile: async (name: string) => {
    const res = await apiClient.put<ApiResponse<{ message: string; name: string }>>("/api/auth/profile", { name });
    return res.data.data;
  },

  // 회원 탈퇴
  deleteAccount: async () => {
    const res = await apiClient.delete<ApiResponse<{ message: string }>>("/api/auth/profile");
    tokenStorage.clear();
    return res.data.data;
  }
};

// Project Service (대시보드 및 실물 API 제어)
export const projectService = {
  getPublicProjects: async (): Promise<Project[]> => {
    const res = await apiClient.get<ApiResponse<Project[]>>("/api/projects");
    return res.data.data;
  },

  createProject: async (data: {
    title: string;
    visibility: "PUBLIC" | "PRIVATE";
    description?: string;
    invitedEmails?: string[];
  }): Promise<Project> => {
    const res = await apiClient.post<ApiResponse<Project>>("/api/projects", data);
    return res.data.data;
  },

  updateProject: async (
    projectId: string,
    data: { title?: string; description?: string; visibility?: "PUBLIC" | "PRIVATE" }
  ): Promise<Project> => {
    const res = await apiClient.put<ApiResponse<Project>>(`/api/projects/${projectId}`, data);
    return res.data.data;
  },

  deleteProject: async (projectId: string): Promise<{ message: string }> => {
    const res = await apiClient.delete<ApiResponse<{ message: string }>>(`/api/projects/${projectId}`);
    return res.data.data;
  },

  getProjectMembers: async (projectId: string): Promise<ProjectMember[]> => {
    const res = await apiClient.get<ApiResponse<ProjectMember[]>>(`/api/projects/${projectId}/members`);
    return res.data.data;
  },

  respondToInvitation: async (projectId: string, accept: boolean): Promise<{ message: string }> => {
    const res = await apiClient.post<ApiResponse<{ message: string }>>(`/api/projects/${projectId}/respond`, { accept });
    return res.data.data;
  },
};