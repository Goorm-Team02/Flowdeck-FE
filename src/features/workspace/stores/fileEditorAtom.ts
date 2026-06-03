import { atom } from 'jotai'

export interface FileEditor {
  actorId: number
  actorName: string
}

// fileId → 현재 미저장 변경이 있는 사용자 (편집 중 = 서버 상태 ≠ 로컬 상태)
export const fileEditorsAtom = atom<Map<number, FileEditor>>(new Map())
