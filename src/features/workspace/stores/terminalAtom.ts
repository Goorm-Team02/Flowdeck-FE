import { atom } from 'jotai'

export const isRunningAtom = atom<boolean>(false)
export const runTriggerAtom = atom<number>(0)
export const stopTriggerAtom = atom<number>(0)

export interface RunCodePayload {
  code: string
  language: string
  filename: string
}

export const runCodePayloadAtom = atom<RunCodePayload | null>(null)
