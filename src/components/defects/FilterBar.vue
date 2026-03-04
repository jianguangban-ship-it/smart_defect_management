<template>
  <div class="filter-bar">
    <div class="filter-row">
      <div class="search-wrap">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          class="search-input input-base"
          type="text"
          :value="search"
          @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
          :placeholder="t('filter.search')"
          data-search-input
        />
      </div>

      <select class="filter-select input-base" :value="severity" @change="$emit('update:severity', ($event.target as HTMLSelectElement).value)">
        <option value="">{{ t('filter.allSeverities') }}</option>
        <option v-for="s in SEVERITIES" :key="s" :value="s">{{ s }}</option>
      </select>

      <select class="filter-select input-base" :value="status" @change="$emit('update:status', ($event.target as HTMLSelectElement).value)">
        <option value="">{{ t('filter.allStatuses') }}</option>
        <option v-for="s in STATUSES" :key="s" :value="s">{{ s }}</option>
      </select>

      <select class="filter-select input-base" :value="category" @change="$emit('update:category', ($event.target as HTMLSelectElement).value)">
        <option value="">{{ t('filter.allCategories') }}</option>
        <option v-for="c in CATEGORIES" :key="c" :value="c">{{ c }}</option>
      </select>

      <select class="filter-select input-base" :value="detectedPhase" @change="$emit('update:detectedPhase', ($event.target as HTMLSelectElement).value)">
        <option value="">{{ t('filter.allPhases') }}</option>
        <option v-for="p in DETECTED_PHASES" :key="p" :value="p">{{ p }}</option>
      </select>

      <button v-if="hasActiveFilters" class="reset-btn" @click="$emit('reset')">{{ t('filter.reset') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/i18n'
import { SEVERITIES, STATUSES, CATEGORIES, DETECTED_PHASES } from '@/config/constants'

defineProps<{
  search: string
  severity: string
  status: string
  category: string
  detectedPhase: string
  hasActiveFilters: boolean
}>()

defineEmits<{
  'update:search': [v: string]
  'update:severity': [v: string]
  'update:status': [v: string]
  'update:category': [v: string]
  'update:detectedPhase': [v: string]
  reset: []
}>()

const { t } = useI18n()
</script>

<style scoped>
.filter-bar {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.filter-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.search-wrap {
  position: relative;
  flex: 1;
  min-width: 200px;
}
.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 15px;
  height: 15px;
  color: var(--text-muted);
  pointer-events: none;
}
.search-input {
  padding-left: 32px;
}
.filter-select {
  width: auto;
  min-width: 130px;
  padding: 8px 10px;
  font-size: 13px;
  cursor: pointer;
}
.reset-btn {
  padding: 8px 12px;
  border-radius: var(--radius-md);
  font-size: 12px;
  font-weight: 500;
  background: transparent;
  color: var(--accent-red);
  border: 1px solid color-mix(in srgb, var(--accent-red) 30%, transparent);
  transition: all 0.15s;
  white-space: nowrap;
}
.reset-btn:hover {
  background-color: color-mix(in srgb, var(--accent-red) 10%, transparent);
}
</style>
