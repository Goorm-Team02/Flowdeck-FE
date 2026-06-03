import { atom } from 'jotai'

export type SidebarPanel = 'filetree' | 'search'

export const activeSidebarPanelAtom = atom<SidebarPanel>('filetree')
export const timelineOpenAtom = atom<boolean>(false)
export const projectTitleAtom = atom<string>('')
