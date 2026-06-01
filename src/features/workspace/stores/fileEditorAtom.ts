import { atom } from 'jotai'

export interface FileEditor {
  actorId: number
  actorName: string
}

// fileId → 마지막으로 해당 파일을 저장/복원한 사용자
export const fileEditorsAtom = atom<Map<number, FileEditor>>(new Map())
