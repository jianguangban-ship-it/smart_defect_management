<template>
  <div class="app">
    <AppHeader />

    <div class="app-body">
      <AppSidebar v-model="currentView" />

      <main class="app-content">
        <!-- Defects View -->
        <div v-if="currentView === 'defects'" class="view-defects">
          <div class="view-toolbar">
            <FilterBar
              v-model:search="filters.search.value"
              v-model:severity="filters.severity.value"
              v-model:status="filters.status.value"
              v-model:category="filters.category.value"
              v-model:detectedPhase="filters.detectedPhase.value"
              v-model:priority="filters.priority.value"
              v-model:vehicle="filters.vehicle.value"
              v-model:product="filters.product.value"
              v-model:dateFrom="filters.dateFrom.value"
              v-model:dateTo="filters.dateTo.value"
              :has-active-filters="filters.hasActiveFilters.value"
              @reset="filters.resetFilters()"
            />
            <button class="btn btn-primary" @click="openCreateForm">
              + {{ t('form.createDefect') }}
            </button>
          </div>

          <DefectTable
            :defects="defectStore.defects.value"
            :is-loading="defectStore.isLoading.value"
            :sort="filters.sort.value"
            :order="filters.order.value"
            @sort="filters.toggleSort"
            @row-click="openDetail"
            @edit="openEditForm"
            @delete="confirmDeleteDefect"
          />

          <div class="view-footer">
            <span class="total-label">{{ t('filter.total') }}: {{ defectStore.total.value }} {{ t('filter.defects') }}</span>
            <div class="footer-right">
              <Pagination
                :current-page="defectStore.currentPage.value"
                :total-pages="defectStore.totalPages.value"
                @change="onPageChange"
              />
              <select class="page-size-select" v-model.number="defaultPageSize">
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Dashboard View -->
        <div v-else-if="currentView === 'dashboard'" class="view-dashboard">
          <StatsPanel :stats="defectStore.stats.value" />
        </div>

        <!-- Settings View -->
        <SettingsView v-else-if="currentView === 'settings'" />
      </main>
    </div>

    <!-- Defect Form Modal -->
    <DefectForm
      v-if="showFormModal"
      :defect="editingDefect"
      @save="handleFormSave"
      @close="showFormModal = false"
    />

    <!-- Defect Detail Slide-out -->
    <DefectDetail
      v-if="selectedDefect"
      :defect="selectedDefect"
      @close="selectedDefect = null"
      @edit="openEditForm"
      @delete="confirmDeleteDefect"
    />

    <!-- Confirm Delete Dialog -->
    <ConfirmDialog
      v-if="showDeleteConfirm"
      :title="t('confirm.deleteTitle')"
      :message="t('confirm.deleteMessage')"
      @confirm="handleDelete"
      @cancel="showDeleteConfirm = false"
    />

    <!-- Hotkey Cheat Sheet Modal -->
    <HotkeyModal v-model="showHotkeyModal" />

    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from '@/i18n'
import { useDefects } from '@/composables/useDefects'
import { useFilters, defaultPageSize } from '@/composables/useFilters'
import { useToast } from '@/composables/useToast'
import type { Defect } from '@/types/api'
import type { ViewType } from '@/types/form'

import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import FilterBar from '@/components/defects/FilterBar.vue'
import DefectTable from '@/components/defects/DefectTable.vue'
import DefectForm from '@/components/defects/DefectForm.vue'
import DefectDetail from '@/components/defects/DefectDetail.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import Pagination from '@/components/shared/Pagination.vue'
import StatsPanel from '@/components/dashboard/StatsPanel.vue'
import SettingsView from '@/components/settings/SettingsView.vue'
import HotkeyModal from '@/components/shared/HotkeyModal.vue'
import ToastContainer from '@/components/shared/ToastContainer.vue'

const { t } = useI18n()
const { addToast } = useToast()
const defectStore = useDefects()
const filters = useFilters()

const currentView = ref<ViewType>('defects')
const showFormModal = ref(false)
const editingDefect = ref<Defect | null>(null)
const selectedDefect = ref<Defect | null>(null)
const showDeleteConfirm = ref(false)
const deletingDefectId = ref<number | null>(null)
const showHotkeyModal = ref(false)

// Fetch data when filters change
watch(
  () => filters.params.value,
  () => defectStore.fetchDefects(filters.params.value as any),
  { immediate: true, deep: true }
)

// Fetch stats when switching to dashboard
watch(currentView, (view) => {
  if (view === 'dashboard') defectStore.fetchStats()
})

function openCreateForm() {
  editingDefect.value = null
  showFormModal.value = true
}

function openEditForm(defect: Defect) {
  editingDefect.value = defect
  selectedDefect.value = null
  showFormModal.value = true
}

function openDetail(defect: Defect) {
  selectedDefect.value = defect
}

function confirmDeleteDefect(defect: Defect) {
  deletingDefectId.value = defect.id
  selectedDefect.value = null
  showDeleteConfirm.value = true
}

async function handleFormSave() {
  showFormModal.value = false
  editingDefect.value = null
  await defectStore.fetchDefects(filters.params.value as any)
}

async function handleDelete() {
  if (deletingDefectId.value === null) return
  try {
    await defectStore.deleteDefect(deletingDefectId.value)
    addToast('success', t('toast.deleteSuccess'))
    await defectStore.fetchDefects(filters.params.value as any)
  } catch (err: any) {
    addToast('error', err.message || t('toast.error'))
  } finally {
    showDeleteConfirm.value = false
    deletingDefectId.value = null
  }
}

function onPageChange(p: number) {
  filters.page.value = p
}

// Keyboard shortcuts
function handleKeyboard(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement).tagName
  const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'

  if (e.key === 'Escape') {
    if (showFormModal.value) showFormModal.value = false
    else if (selectedDefect.value) selectedDefect.value = null
    else if (showDeleteConfirm.value) showDeleteConfirm.value = false
    else if (showHotkeyModal.value) showHotkeyModal.value = false
  } else if (e.key === 'n' && !inInput && !e.ctrlKey && !e.metaKey) {
    e.preventDefault()
    openCreateForm()
  } else if (e.key === '/' && !inInput && !e.ctrlKey && !e.metaKey) {
    e.preventDefault()
    const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]')
    searchInput?.focus()
  } else if (e.key === '?' && !inInput && !e.ctrlKey && !e.metaKey) {
    e.preventDefault()
    showHotkeyModal.value = true
  }
}

onMounted(() => document.addEventListener('keydown', handleKeyboard))
onUnmounted(() => document.removeEventListener('keydown', handleKeyboard))
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.app-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}
.app-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}
.view-defects {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}
.view-toolbar {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.view-toolbar > :first-child {
  flex: 1;
}
.view-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
}
.total-label {
  font-size: 13px;
  color: var(--text-muted);
}
.footer-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.page-size-select {
  height: 32px;
  padding: 0 8px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
}

/* Shared button styles */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  white-space: nowrap;
}
.btn-primary {
  background-color: var(--accent-blue);
  color: white;
}
.btn-primary:hover {
  opacity: 0.9;
}

@media (max-width: 768px) {
  .app-body {
    flex-direction: column;
  }
  .view-toolbar {
    flex-direction: column;
  }
}
</style>
