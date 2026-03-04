import { ref, computed } from 'vue'

export function useFilters() {
  const search = ref('')
  const severity = ref('')
  const priority = ref('')
  const status = ref('')
  const category = ref('')
  const detectedPhase = ref('')
  const page = ref(1)
  const limit = ref(20)
  const sort = ref('id')
  const order = ref<'asc' | 'desc'>('desc')

  const params = computed(() => ({
    search: search.value || undefined,
    severity: severity.value || undefined,
    priority: priority.value || undefined,
    status: status.value || undefined,
    category: category.value || undefined,
    detectedPhase: detectedPhase.value || undefined,
    page: page.value,
    limit: limit.value,
    sort: sort.value,
    order: order.value,
  }))

  const hasActiveFilters = computed(() =>
    !!(search.value || severity.value || priority.value || status.value || category.value || detectedPhase.value)
  )

  function resetFilters() {
    search.value = ''
    severity.value = ''
    priority.value = ''
    status.value = ''
    category.value = ''
    detectedPhase.value = ''
    page.value = 1
  }

  function toggleSort(field: string) {
    if (sort.value === field) {
      order.value = order.value === 'asc' ? 'desc' : 'asc'
    } else {
      sort.value = field
      order.value = 'desc'
    }
    page.value = 1
  }

  return {
    search, severity, priority, status, category, detectedPhase,
    page, limit, sort, order, params, hasActiveFilters,
    resetFilters, toggleSort,
  }
}
