import { useSocketClient } from './useSocketClient'

export function usePublish() {
  const { publish } = useSocketClient()
  return publish
}
