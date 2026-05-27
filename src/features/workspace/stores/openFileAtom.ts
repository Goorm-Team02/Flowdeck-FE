import { atom } from 'jotai'

// 현재 열린 파일 ID (null = 아무 파일도 열리지 않음)
export const openFileIdAtom = atom<number | null>(null)

// 파일 로드 시 저장 — 저장 요청 시 baseRevision으로 사용
export const baseRevisionAtom = atom<number | null>(null)
