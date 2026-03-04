<template>
  <div class="stat-card" :style="{ '--card-color': color }">
    <span class="stat-label">{{ label }}</span>
    <span class="stat-value">{{ value }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; value: number | string; color?: string }>()
</script>

<style scoped>
.stat-card {
  --card-color: var(--accent-blue);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-left: 3px solid var(--card-color);
}
.stat-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--card-color);
  font-family: var(--font-mono);
}
</style>
