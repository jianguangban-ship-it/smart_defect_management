<template>
  <span class="priority-badge" :style="{ '--badge-color': color }">{{ priority }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { PRIORITY_COLORS } from '@/config/constants'

const props = defineProps<{ priority: string }>()
const color = computed(() => PRIORITY_COLORS[props.priority] || '#768390')
</script>

<style scoped>
.priority-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 600;
  font-family: var(--font-mono);
  color: var(--badge-color);
  background-color: color-mix(in srgb, var(--badge-color) 15%, transparent);
  white-space: nowrap;
}
</style>
