<template>
  <div class="empty-state">
    <div class="empty-icon">&#9888;</div>
    <p class="empty-title">{{ title }}</p>
    <p v-if="hint" class="empty-hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; hint?: string }>()
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: var(--text-muted);
}
.empty-icon {
  font-size: 36px;
  margin-bottom: 12px;
  opacity: 0.4;
}
.empty-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-secondary);
}
.empty-hint {
  font-size: 13px;
  margin-top: 4px;
}
</style>
