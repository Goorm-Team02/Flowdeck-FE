export const fileTreeKeys = {
  all: (projectId: string) => ['projects', projectId, 'files'] as const,
  search: (projectId: string, keyword: string) =>
    ['projects', projectId, 'files', 'search', keyword] as const,
}
