import { atom } from 'jotai'

export const memberModalOpenAtom = atom<boolean>(false)

export interface RoleChangeNotification {
  previousRole: string
  currentRole: string
}

export const roleChangeNotificationAtom = atom<RoleChangeNotification | null>(null)
