import { atom } from 'jotai'

export type SidebarPanel = 'filetree' | 'search'

export const activeSidebarPanelAtom = atom<SidebarPanel>('filetree')
export const historyOpenAtom = atom<boolean>(false)
