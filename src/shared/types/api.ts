export interface ApiResponse<T = unknown> {
  success: boolean
  code: string
  message: string
  data: T
}

export interface PageMeta {
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface PagedData<T> {
  content: T[]
  meta: PageMeta
}
