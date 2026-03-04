<template>
  <aside class="sidebar">
    <div class="sidebar-logo">
      <span class="logo-icon">&#9670;</span>
      <span class="logo-text">SDM</span>
    </div>
    <nav class="sidebar-nav" role="navigation">
      <button
        v-for="item in navItems"
        :key="item.view"
        class="nav-btn"
        :class="{ active: modelValue === item.view }"
        @click="$emit('update:modelValue', item.view)"
        :title="item.label"
        :aria-current="modelValue === item.view ? 'page' : undefined"
      >
        <span class="nav-icon" v-html="item.icon"></span>
        <span class="nav-label">{{ item.label }}</span>
      </button>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import type { ViewType } from '@/types/form'

const { t } = useI18n()

defineProps<{ modelValue: ViewType }>()
defineEmits<{ 'update:modelValue': [view: ViewType] }>()

const navItems = computed(() => [
  { view: 'defects' as ViewType, label: t('nav.defects'), icon: '&#9888;' },
  { view: 'dashboard' as ViewType, label: t('nav.dashboard'), icon: '&#9632;' },
  { view: 'settings' as ViewType, label: t('nav.settings'), icon: '&#9881;' },
])
</script>

<style scoped>
.sidebar {
  width: 64px;
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 12px;
  gap: 8px;
  flex-shrink: 0;
}
.sidebar-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 12px;
}
.logo-icon {
  font-size: 20px;
  color: var(--accent-blue);
}
.logo-text {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 1px;
}
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  padding: 0 8px;
}
.nav-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 4px;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-muted);
  transition: all 0.2s;
  width: 100%;
}
.nav-btn:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}
.nav-btn.active {
  background-color: rgba(88, 166, 255, 0.12);
  color: var(--accent-blue);
}
.nav-icon {
  font-size: 18px;
  line-height: 1;
}
.nav-label {
  font-size: 10px;
  font-weight: 500;
  white-space: nowrap;
}
</style>
