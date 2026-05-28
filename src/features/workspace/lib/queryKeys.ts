export const fileTreeKeys = {
  all: (projectId: string) => ['projects', projectId, 'files'] as const,
  search: (projectId: string, keyword: string) =>
    ['projects', projectId, 'files', 'search', keyword] as const,
  detail: (projectId: string, fileId: number) => ['projects', projectId, 'files', fileId] as const,
}

export const fileVersionKeys = {
  all: (projectId: string, fileId: number) =>
    ['projects', projectId, 'files', fileId, 'versions'] as const,
  detail: (projectId: string, fileId: number, versionId: number) =>
    ['projects', projectId, 'files', fileId, 'versions', versionId] as const,
  diff: (projectId: string, fileId: number, from: number, to: number) =>
    ['projects', projectId, 'files', fileId, 'versions', 'diff', from, to] as const,
  timeline: (projectId: string, fileId: number) =>
    ['projects', projectId, 'files', fileId, 'versions', 'timeline'] as const,
}

export const chatKeys = {
  messages: (projectId: string) => ['projects', projectId, 'messages'] as const,
  search: (projectId: string, keyword: string) =>
    ['projects', projectId, 'messages', 'search', keyword] as const,
}
