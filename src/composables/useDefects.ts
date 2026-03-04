import { ref } from 'vue'
import { useApi } from './useApi'
import type { Defect, DefectCreateInput, DefectUpdateInput, PaginatedResponse, DefectStats } from '@/types/api'

const { request } = useApi()

export function useDefects() {
  const defects = ref<Defect[]>([])
  const total = ref(0)
  const totalPages = ref(0)
  const currentPage = ref(1)
  const isLoading = ref(false)
  const stats = ref<DefectStats | null>(null)

  async function fetchDefects(params: Record<string, string | number | undefined> = {}) {
    isLoading.value = true
    try {
      const res = await request<PaginatedResponse<Defect>>('/defects', { params })
      defects.value = res.data
      total.value = res.total
      totalPages.value = res.totalPages
      currentPage.value = res.page
    } finally {
      isLoading.value = false
    }
  }

  async function fetchDefect(id: number): Promise<Defect> {
    return request<Defect>(`/defects/${id}`)
  }

  async function createDefect(data: DefectCreateInput): Promise<Defect> {
    return request<Defect>('/defects', { method: 'POST', body: data })
  }

  async function updateDefect(id: number, data: DefectUpdateInput): Promise<Defect> {
    return request<Defect>(`/defects/${id}`, { method: 'PUT', body: data })
  }

  async function deleteDefect(id: number): Promise<void> {
    await request(`/defects/${id}`, { method: 'DELETE' })
  }

  async function fetchStats(): Promise<DefectStats> {
    const s = await request<DefectStats>('/defects/stats')
    stats.value = s
    return s
  }

  return {
    defects, total, totalPages, currentPage, isLoading, stats,
    fetchDefects, fetchDefect, createDefect, updateDefect, deleteDefect, fetchStats,
  }
}
