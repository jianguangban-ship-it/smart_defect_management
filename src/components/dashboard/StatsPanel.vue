<template>
  <div class="stats-panel" v-if="stats">
    <h2 class="panel-title">{{ t('dashboard.title') }}</h2>

    <!-- Overview Cards -->
    <div class="cards-row">
      <StatCard :label="t('dashboard.totalDefects')" :value="stats.total" color="var(--accent-blue)" />
      <StatCard :label="t('dashboard.openDefects')" :value="stats.byStatus['Open'] || 0" color="var(--accent-blue)" />
      <StatCard :label="t('dashboard.inProgress')" :value="stats.byStatus['In Progress'] || 0" color="var(--accent-orange)" />
      <StatCard :label="t('dashboard.fixedDefects')" :value="stats.byStatus['Fixed'] || 0" color="var(--accent-green)" />
    </div>

    <!-- Charts -->
    <div class="charts-grid">
      <ChartPanel :title="t('dashboard.bySeverity')" :items="severityItems" />
      <ChartPanel :title="t('dashboard.byStatus')" :items="statusItems" />
      <ChartPanel :title="t('dashboard.byCategory')" :items="categoryItems" />
      <ChartPanel :title="t('dashboard.byPriority')" :items="priorityItems" />
    </div>
  </div>

  <div v-else class="stats-loading">
    <span class="spinner"></span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import { SEVERITY_COLORS, STATUS_COLORS, PRIORITY_COLORS } from '@/config/constants'
import type { DefectStats } from '@/types/api'
import StatCard from './StatCard.vue'
import ChartPanel from './ChartPanel.vue'

const props = defineProps<{ stats: DefectStats | null }>()
const { t } = useI18n()

function toItems(record: Record<string, number>, colorMap?: Record<string, string>) {
  return Object.entries(record).map(([label, count]) => ({
    label,
    count,
    color: colorMap?.[label],
  }))
}

const severityItems = computed(() => props.stats ? toItems(props.stats.bySeverity, SEVERITY_COLORS) : [])
const statusItems = computed(() => props.stats ? toItems(props.stats.byStatus, STATUS_COLORS) : [])
const categoryItems = computed(() => props.stats ? toItems(props.stats.byCategory) : [])
const priorityItems = computed(() => props.stats ? toItems(props.stats.byPriority, PRIORITY_COLORS) : [])
</script>

<style scoped>
.stats-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.panel-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}
.cards-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}
.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.stats-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
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

@media (max-width: 768px) {
  .charts-grid { grid-template-columns: 1fr; }
}
</style>
