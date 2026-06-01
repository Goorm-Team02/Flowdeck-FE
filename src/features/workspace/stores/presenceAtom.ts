import { atom } from 'jotai'

import type { PresenceMember } from '@/shared/socket/types'

export const presenceAtom = atom<{ count: number; members: PresenceMember[] }>({
  count: 0,
  members: [],
})
