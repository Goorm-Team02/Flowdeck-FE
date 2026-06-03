import { atom } from 'jotai'

// 현재 열린 파일 ID (null = 아무 파일도 열리지 않음)
export const openFileIdAtom = atom<number | null>(null)

// 파일 로드 시 저장 — 저장 요청 시 baseRevision으로 사용
export const baseRevisionAtom = atom<number | null>(null)

// 서버에 저장되지 않은 변경 사항 여부
export const isDirtyAtom = atom<boolean>(false)

// 409 충돌 발생 여부
export const saveConflictAtom = atom<boolean>(false)

// 현재 에디터에 열린 파일 이름 (TopBar에서 언어 판별 용)
export const openFileNameAtom = atom<string>('')

// 현재 에디터 내용 (실행 버튼에서 읽기 용)
export const editorContentAtom = atom<string>('')
