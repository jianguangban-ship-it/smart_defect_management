<template>
  <span class="severity-badge" :style="{ '--badge-color': color }">{{ severity }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SEVERITY_COLORS } from '@/config/constants'

const props = defineProps<{ severity: string }>()
const color = computed(() => SEVERITY_COLORS[props.severity] || '#768390')
</script>

<style scoped>
.severity-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  color: var(--badge-color);
  background-color: color-mix(in srgb, var(--badge-color) 15%, transparent);
  white-space: nowrap;
}
</style>
