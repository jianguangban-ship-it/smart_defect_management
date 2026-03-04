import { ref, computed, watch } from 'vue'

const LS_PAGE_SIZE = 'settings-page-size'

/** Shared page-size ref — readable/writable from SettingsView and useFilters */
export const defaultPageSize = ref(Number(localStorage.getItem(LS_PAGE_SIZE)) || 20)

watch(defaultPageSize, (v) => localStorage.setItem(LS_PAGE_SIZE, String(v)))

export function useFilters() {
  const search = ref('')
  const severity = ref('')
  const priority = ref('')
  const status = ref('')
  const category = ref('')
  const detectedPhase = ref('')
  const vehicle = ref('')
  const product = ref('')
  const dateFrom = ref('')
  const dateTo = ref('')
  const page = ref(1)
  const limit = defaultPageSize
  const sort = ref('id')
  const order = ref<'asc' | 'desc'>('desc')

  const params = computed(() => ({
    search: search.value || undefined,
    severity: severity.value || undefined,
    priority: priority.value || undefined,
    status: status.value || undefined,
    category: category.value || undefined,
    detectedPhase: detectedPhase.value || undefined,
    vehicle: vehicle.value || undefined,
    product: product.value || undefined,
    dateFrom: dateFrom.value || undefined,
    dateTo: dateTo.value || undefined,
    page: page.value,
    limit: limit.value,
    sort: sort.value,
    order: order.value,
  }))

  const hasActiveFilters = computed(() =>
    !!(search.value || severity.value || priority.value || status.value || category.value || detectedPhase.value || vehicle.value || product.value || dateFrom.value || dateTo.value)
  )

  function resetFilters() {
    search.value = ''
    severity.value = ''
    priority.value = ''
    status.value = ''
    category.value = ''
    detectedPhase.value = ''
    vehicle.value = ''
    product.value = ''
    dateFrom.value = ''
    dateTo.value = ''
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
    search, severity, priority, status, category, detectedPhase, vehicle, product, dateFrom, dateTo,
    page, limit, sort, order, params, hasActiveFilters,
    resetFilters, toggleSort,
  }
}
