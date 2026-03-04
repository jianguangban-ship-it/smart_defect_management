<template>
  <div class="chart-panel">
    <h4 class="chart-title">{{ title }}</h4>
    <div class="chart-bars">
      <div v-for="item in sortedItems" :key="item.label" class="bar-row">
        <span class="bar-label">{{ item.label }}</span>
        <div class="bar-track">
          <div
            class="bar-fill"
            :style="{ width: barWidth(item.count) + '%', backgroundColor: item.color || 'var(--accent-blue)' }"
          ></div>
        </div>
        <span class="bar-count">{{ item.count }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ChartItem { label: string; count: number; color?: string }
const props = defineProps<{ title: string; items: ChartItem[] }>()

const maxCount = computed(() => Math.max(...props.items.map(i => i.count), 1))
const sortedItems = computed(() => [...props.items].sort((a, b) => b.count - a.count))

function barWidth(count: number) {
  return Math.round((count / maxCount.value) * 100)
}
</script>

<style scoped>
.chart-panel {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 16px 20px;
}
.chart-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 14px;
}
.chart-bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.bar-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.bar-label {
  font-size: 12px;
  color: var(--text-secondary);
  min-width: 90px;
  text-align: right;
  white-space: nowrap;
}
.bar-track {
  flex: 1;
  height: 18px;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  border-radius: var(--radius-sm);
  transition: width 0.4s ease-out;
  min-width: 2px;
}
.bar-count {
  font-size: 12px;
  font-weight: 600;
  font-family: var(--font-mono);
  color: var(--text-primary);
  min-width: 24px;
  text-align: right;
}
</style>
