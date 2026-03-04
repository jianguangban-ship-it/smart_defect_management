<template>
  <div v-if="totalPages > 1" class="pagination">
    <button class="page-btn" :disabled="currentPage <= 1" @click="$emit('change', currentPage - 1)">&lt;</button>
    <template v-for="p in pages" :key="p">
      <span v-if="p === '...'" class="page-ellipsis">...</span>
      <button v-else class="page-btn" :class="{ active: p === currentPage }" @click="$emit('change', p as number)">{{ p }}</button>
    </template>
    <button class="page-btn" :disabled="currentPage >= totalPages" @click="$emit('change', currentPage + 1)">&gt;</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ currentPage: number; totalPages: number }>()
defineEmits<{ change: [page: number] }>()

const pages = computed(() => {
  const total = props.totalPages
  const current = props.currentPage
  const items: (number | string)[] = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) items.push(i)
  } else {
    items.push(1)
    if (current > 3) items.push('...')
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      items.push(i)
    }
    if (current < total - 2) items.push('...')
    items.push(total)
  }
  return items
})
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  gap: 4px;
}
.page-btn {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  transition: all 0.15s;
}
.page-btn:hover:not(:disabled):not(.active) {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}
.page-btn.active {
  background-color: var(--accent-blue);
  color: white;
  border-color: var(--accent-blue);
}
.page-btn:disabled {
  opacity: 0.4;
}
.page-ellipsis {
  padding: 0 4px;
  color: var(--text-muted);
  font-size: 13px;
}
</style>
