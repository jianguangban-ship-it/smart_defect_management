<template>
  <div class="table-container">
    <div v-if="isLoading" class="table-loading">
      <span class="spinner"></span>
    </div>

    <EmptyState
      v-else-if="defects.length === 0"
      :title="t('filter.noResults')"
      :hint="t('filter.noResultsHint')"
    />

    <table v-else class="defect-table">
      <thead>
        <tr>
          <th class="col-id" @click="$emit('sort', 'id')">
            {{ t('table.id') }}
            <span v-if="sort === 'id'" class="sort-arrow">{{ order === 'asc' ? '&#9650;' : '&#9660;' }}</span>
          </th>
          <th class="col-title" @click="$emit('sort', 'title')">
            {{ t('table.title') }}
            <span v-if="sort === 'title'" class="sort-arrow">{{ order === 'asc' ? '&#9650;' : '&#9660;' }}</span>
          </th>
          <th class="col-severity" @click="$emit('sort', 'severity')">
            {{ t('table.severity') }}
            <span v-if="sort === 'severity'" class="sort-arrow">{{ order === 'asc' ? '&#9650;' : '&#9660;' }}</span>
          </th>
          <th class="col-status" @click="$emit('sort', 'status')">
            {{ t('table.status') }}
            <span v-if="sort === 'status'" class="sort-arrow">{{ order === 'asc' ? '&#9650;' : '&#9660;' }}</span>
          </th>
          <th class="col-category">{{ t('table.category') }}</th>
          <th class="col-assignee">{{ t('table.assignee') }}</th>
          <th class="col-date" @click="$emit('sort', 'createdAt')">
            {{ t('table.date') }}
            <span v-if="sort === 'createdAt'" class="sort-arrow">{{ order === 'asc' ? '&#9650;' : '&#9660;' }}</span>
          </th>
          <th class="col-actions">{{ t('table.actions') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="d in defects"
          :key="d.id"
          class="defect-row"
          @click="$emit('row-click', d)"
        >
          <td class="col-id"><span class="id-badge">#{{ d.id }}</span></td>
          <td class="col-title">
            <span class="title-text">{{ d.title }}</span>
            <span v-if="d.component" class="component-tag">{{ d.component }}</span>
          </td>
          <td class="col-severity"><SeverityBadge :severity="d.severity" /></td>
          <td class="col-status"><DefectStatusBadge :status="d.status" /></td>
          <td class="col-category"><span class="category-text">{{ d.category }}</span></td>
          <td class="col-assignee"><span class="assignee-text">{{ shortName(d.assigneeName) }}</span></td>
          <td class="col-date"><span class="date-text">{{ formatDate(d.createdAt) }}</span></td>
          <td class="col-actions" @click.stop>
            <button class="action-btn" @click="$emit('edit', d)" title="Edit">&#9998;</button>
            <button class="action-btn action-delete" @click="$emit('delete', d)" title="Delete">&#10005;</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/i18n'
import type { Defect } from '@/types/api'
import SeverityBadge from './SeverityBadge.vue'
import DefectStatusBadge from './DefectStatusBadge.vue'
import EmptyState from '@/components/shared/EmptyState.vue'

defineProps<{
  defects: Defect[]
  isLoading: boolean
  sort: string
  order: string
}>()

defineEmits<{
  sort: [field: string]
  'row-click': [defect: Defect]
  edit: [defect: Defect]
  delete: [defect: Defect]
}>()

const { t } = useI18n()

function shortName(name: string): string {
  if (!name) return '-'
  const match = name.match(/\(([^)]+)\)/)
  return match ? match[1] : name
}

function formatDate(iso: string): string {
  if (!iso) return '-'
  const d = new Date(iso)
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
</script>

<style scoped>
.table-container {
  flex: 1;
  overflow-x: auto;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--bg-secondary);
}
.table-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
}
.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-color);
  border-top-color: var(--accent-blue);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.defect-table {
  width: 100%;
  border-collapse: collapse;
}
.defect-table th {
  padding: 10px 12px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-tertiary);
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}
.defect-table th:hover {
  color: var(--text-primary);
}
.sort-arrow {
  font-size: 9px;
  margin-left: 2px;
  color: var(--accent-blue);
}
.defect-row {
  cursor: pointer;
  transition: background-color 0.1s;
}
.defect-row:hover {
  background-color: var(--bg-tertiary);
}
.defect-row td {
  padding: 10px 12px;
  font-size: 13px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-secondary);
}
.defect-row:last-child td {
  border-bottom: none;
}
.id-badge {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-muted);
}
.col-title {
  max-width: 300px;
}
.title-text {
  display: block;
  color: var(--text-primary);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.component-tag {
  display: inline-block;
  margin-top: 2px;
  font-size: 10px;
  padding: 1px 5px;
  border-radius: var(--radius-sm);
  background-color: var(--bg-tertiary);
  color: var(--text-muted);
}
.category-text,
.assignee-text,
.date-text {
  font-size: 12px;
  white-space: nowrap;
}
.col-actions {
  white-space: nowrap;
}
.action-btn {
  padding: 4px 6px;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-muted);
  font-size: 13px;
  transition: all 0.15s;
}
.action-btn:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}
.action-delete:hover {
  color: var(--accent-red);
}
</style>
