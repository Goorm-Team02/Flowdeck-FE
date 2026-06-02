import { atom } from 'jotai'

import { tokenStorage } from '@/shared/api/client'

import type { CurrentUser } from '../utils/jwt'
import { parseCurrentUser } from '../utils/jwt'

export const currentUserAtom = atom<CurrentUser | null>(parseCurrentUser(tokenStorage.getAccess()))
