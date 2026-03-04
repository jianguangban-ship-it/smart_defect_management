<template>
  <span class="status-badge" :style="{ '--badge-color': color }">
    <span class="status-dot"></span>
    {{ status }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { STATUS_COLORS } from '@/config/constants'

const props = defineProps<{ status: string }>()
const color = computed(() => STATUS_COLORS[props.status] || '#768390')
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
  color: var(--badge-color);
  background-color: color-mix(in srgb, var(--badge-color) 12%, transparent);
  white-space: nowrap;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--badge-color);
}
</style>
