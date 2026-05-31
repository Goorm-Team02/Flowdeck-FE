import { useNavigate } from 'react-router-dom'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { leaveProject } from '../api/members'

export function useLeaveProject(projectId: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => leaveProject(projectId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['projects', projectId] })
      navigate('/')
    },
  })
}
