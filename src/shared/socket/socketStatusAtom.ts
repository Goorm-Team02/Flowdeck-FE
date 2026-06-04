import { atom } from 'jotai'
import type { SocketStatus } from './types'

export const socketStatusAtom = atom<SocketStatus>('disconnected')
