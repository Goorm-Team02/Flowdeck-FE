export const fileTreeKeys = {
  all: (projectId: string) => ['projects', projectId, 'files'] as const,
  search: (projectId: string, keyword: string) =>
    ['projects', projectId, 'files', 'search', keyword] as const,
  detail: (projectId: string, fileId: number) =>
    ['projects', projectId, 'files', fileId] as const,
}
