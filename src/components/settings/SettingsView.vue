<template>
  <div class="settings-view">
    <div class="settings-top-row">
      <!-- Webhook Config (left) -->
      <div class="settings-card settings-card--left">
        <div class="card-header">{{ t('settings.title') }}</div>

        <div class="form-group">
          <label class="form-label">{{ t('settings.webhookUrl') }}</label>
          <div class="url-row">
            <input class="input-base url-input" v-model="form.url" :placeholder="t('settings.webhookUrlPlaceholder')" type="url" />
            <button class="btn btn-outline" :disabled="isTesting || !form.url" @click="handleTest">
              {{ isTesting ? t('settings.testing') : t('settings.testWebhook') }}
            </button>
          </div>
        </div>

        <div class="form-row-3">
          <div class="form-group">
            <label class="form-label">{{ t('settings.platform') }}</label>
            <select class="input-base" v-model="form.platform">
              <option value="dingtalk">{{ t('settings.dingtalk') }}</option>
              <option value="wecom">{{ t('settings.wecom') }}</option>
              <option value="feishu">{{ t('settings.feishu') }}</option>
              <option value="custom">{{ t('settings.customJson') }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('settings.payloadFormat') }}</label>
            <select class="input-base" v-model="form.payloadFormat">
              <option value="full">{{ t('settings.fullDefects') }}</option>
              <option value="summary">{{ t('settings.summaryDigest') }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('settings.schedule') }}</label>
            <select class="input-base" v-model="form.schedule">
              <option value="disabled">{{ t('settings.disabled') }}</option>
              <option value="every_hour">{{ t('settings.everyHour') }}</option>
              <option value="every_6h">{{ t('settings.every6Hours') }}</option>
              <option value="daily_9">{{ t('settings.dailyAt9') }}</option>
              <option value="weekly_mon_9">{{ t('settings.weeklyMonday9') }}</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">{{ t('settings.customKeywords') }}</label>
          <input class="input-base" v-model="form.customKeywords" :placeholder="t('settings.customKeywordsPlaceholder')" />
          <span class="form-hint">{{ t('settings.customKeywordsHint') }}</span>
        </div>

        <div v-if="config?.nextRunAt && form.schedule !== 'disabled'" class="next-run">
          {{ t('settings.nextRun') }}: <span class="next-run-time">{{ formatDate(config.nextRunAt) }}</span>
        </div>
      </div>

      <!-- View SendPayload (right) -->
      <div class="settings-card settings-card--right">
        <div class="card-header-row">
          <div class="card-header">{{ t('settings.viewPayload') }}</div>
          <button class="btn btn-outline btn-sm" :disabled="isPreviewing" @click="handleRefreshPreview">
            {{ isPreviewing ? t('settings.refreshing') : t('settings.refreshPreview') }}
          </button>
        </div>

        <div class="payload-preview">
          <div v-if="!editablePayload && !isPreviewing" class="payload-empty">
            {{ t('settings.emptyPayload') }}
          </div>
          <div v-else-if="isPreviewing" class="payload-empty">
            {{ t('settings.refreshing') }}
          </div>
          <textarea
            v-else
            class="payload-editor"
            v-model="editablePayload"
            spellcheck="false"
          ></textarea>
        </div>

        <div class="payload-actions">
          <span v-if="isPayloadEdited" class="payload-edited-hint">{{ t('settings.editedHint') }}</span>
          <button class="btn btn-primary btn-sm" :disabled="isTesting || !form.url || !editablePayload" @click="handleInstantSend">
            {{ isTesting ? t('settings.sending') : t('settings.instantSend') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Defect Filter -->
    <div class="settings-card">
      <div class="card-header-row">
        <div class="card-header">{{ t('settings.defectFilter') }}</div>
        <button v-if="hasActiveFilter" class="btn btn-outline btn-sm" @click="resetAllFilters">
          {{ t('settings.resetFilters') }}
        </button>
      </div>

      <div class="form-row-3">
        <div class="form-group">
          <div class="label-row">
            <label class="form-label">{{ t('defect.severity') }}</label>
            <button v-if="form.filterSeverity.length" class="filter-clear" @click="form.filterSeverity = []">&times;</button>
          </div>
          <select class="input-base" v-model="form.filterSeverity" multiple>
            <option v-for="s in SEVERITIES" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <div class="form-group">
          <div class="label-row">
            <label class="form-label">{{ t('defect.status') }}</label>
            <button v-if="form.filterStatus.length" class="filter-clear" @click="form.filterStatus = []">&times;</button>
          </div>
          <select class="input-base" v-model="form.filterStatus" multiple>
            <option v-for="s in STATUSES" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <div class="form-group">
          <div class="label-row">
            <label class="form-label">{{ t('defect.priority') }}</label>
            <button v-if="form.filterPriority.length" class="filter-clear" @click="form.filterPriority = []">&times;</button>
          </div>
          <select class="input-base" v-model="form.filterPriority" multiple>
            <option v-for="p in PRIORITIES" :key="p" :value="p">{{ p }}</option>
          </select>
        </div>
      </div>

      <div class="form-row-3">
        <div class="form-group">
          <div class="label-row">
            <label class="form-label">{{ t('defect.vehicle') }}</label>
            <button v-if="form.filterVehicle" class="filter-clear" @click="form.filterVehicle = ''">&times;</button>
          </div>
          <select class="input-base" v-model="form.filterVehicle">
            <option value="">{{ t('filter.allVehicles') }}</option>
            <option v-for="v in VEHICLE_OPTIONS" :key="v" :value="v">{{ v }}</option>
          </select>
        </div>
        <div class="form-group">
          <div class="label-row">
            <label class="form-label">{{ t('defect.product') }}</label>
            <button v-if="form.filterProduct" class="filter-clear" @click="form.filterProduct = ''">&times;</button>
          </div>
          <select class="input-base" v-model="form.filterProduct">
            <option value="">{{ t('filter.allProducts') }}</option>
            <option v-for="p in PRODUCT_OPTIONS" :key="p" :value="p">{{ p }}</option>
          </select>
        </div>
        <div class="form-group">
          <div class="label-row">
            <label class="form-label">{{ t('settings.dateRange') }}</label>
            <button v-if="form.dateRange !== 'all'" class="filter-clear" @click="form.dateRange = 'all'">&times;</button>
          </div>
          <select class="input-base" v-model="form.dateRange">
            <option value="all">{{ t('settings.allTime') }}</option>
            <option value="last_24h">{{ t('settings.last24h') }}</option>
            <option value="last_7d">{{ t('settings.last7d') }}</option>
            <option value="last_30d">{{ t('settings.last30d') }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Save -->
    <div class="save-row">
      <button class="btn btn-primary" :disabled="isLoading" @click="handleSave">
        {{ isLoading ? t('settings.saving') : t('settings.save') }}
      </button>
    </div>

    <!-- Delivery History -->
    <div class="settings-card">
      <div class="card-header">{{ t('settings.deliveryHistory') }}</div>

      <div v-if="history.length === 0" class="empty-history">{{ t('settings.noHistory') }}</div>
      <table v-else class="history-table">
        <thead>
          <tr>
            <th>{{ t('settings.historyTime') }}</th>
            <th>{{ t('settings.historyStatus') }}</th>
            <th>{{ t('settings.historyHttp') }}</th>
            <th>{{ t('settings.historyCount') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="h in history" :key="h.id">
            <td class="cell-time">{{ formatDate(h.triggeredAt) }}</td>
            <td>
              <span class="status-badge" :class="h.status">
                {{ h.status === 'success' ? t('settings.success') : t('settings.error') }}
              </span>
            </td>
            <td>{{ h.httpStatus ?? '-' }}</td>
            <td>{{ h.defectCount }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from '@/i18n'
import { useWebhook } from '@/composables/useWebhook'
import { useToast } from '@/composables/useToast'
import { SEVERITIES, PRIORITIES, STATUSES, VEHICLE_OPTIONS, PRODUCT_OPTIONS } from '@/config/constants'
import type { WebhookPlatform, PayloadFormat, SchedulePreset, DateRangePreset } from '@/types/api'

const { t } = useI18n()
const { addToast } = useToast()
const { config, history, isLoading, isTesting, isPreviewing, previewPayload, fetchConfig, saveConfig, testWebhook, sendRawPayload, fetchPreview, fetchHistory } = useWebhook()

const editablePayload = ref('')
const generatedPayload = ref('')

const isPayloadEdited = computed(() => {
  return editablePayload.value !== '' && editablePayload.value !== generatedPayload.value
})

const form = reactive({
  url: '',
  platform: 'dingtalk' as WebhookPlatform,
  payloadFormat: 'full' as PayloadFormat,
  schedule: 'disabled' as SchedulePreset,
  filterSeverity: [] as string[],
  filterStatus: [] as string[],
  filterPriority: [] as string[],
  filterVehicle: '',
  filterProduct: '',
  dateRange: 'all' as DateRangePreset,
  customKeywords: '',
})

function populateForm() {
  if (!config.value) return
  form.url = config.value.url
  form.platform = config.value.platform || 'dingtalk'
  form.payloadFormat = config.value.payloadFormat
  form.schedule = config.value.schedule
  form.filterSeverity = config.value.filterSeverity ? config.value.filterSeverity.split(',').filter(Boolean) : []
  form.filterStatus = config.value.filterStatus ? config.value.filterStatus.split(',').filter(Boolean) : []
  form.filterPriority = config.value.filterPriority ? config.value.filterPriority.split(',').filter(Boolean) : []
  form.filterVehicle = config.value.filterVehicle
  form.filterProduct = config.value.filterProduct
  form.dateRange = config.value.dateRange
  form.customKeywords = config.value.customKeywords
}

async function handleSave() {
  try {
    await saveConfig({
      url: form.url,
      platform: form.platform,
      payloadFormat: form.payloadFormat,
      schedule: form.schedule,
      filterSeverity: form.filterSeverity.join(','),
      filterStatus: form.filterStatus.join(','),
      filterPriority: form.filterPriority.join(','),
      filterVehicle: form.filterVehicle,
      filterProduct: form.filterProduct,
      dateRange: form.dateRange,
      customKeywords: form.customKeywords,
    })
    addToast('success', t('settings.saved'))
  } catch (err: any) {
    addToast('error', err.message || t('toast.error'))
  }
}

const hasActiveFilter = computed(() => {
  return form.filterSeverity.length > 0
    || form.filterStatus.length > 0
    || form.filterPriority.length > 0
    || form.filterVehicle !== ''
    || form.filterProduct !== ''
    || form.dateRange !== 'all'
})

function resetAllFilters() {
  form.filterSeverity = []
  form.filterStatus = []
  form.filterPriority = []
  form.filterVehicle = ''
  form.filterProduct = ''
  form.dateRange = 'all'
}

function getFormData() {
  return {
    url: form.url,
    platform: form.platform,
    payloadFormat: form.payloadFormat,
    schedule: form.schedule,
    filterSeverity: form.filterSeverity.join(','),
    filterStatus: form.filterStatus.join(','),
    filterPriority: form.filterPriority.join(','),
    filterVehicle: form.filterVehicle,
    filterProduct: form.filterProduct,
    dateRange: form.dateRange,
    customKeywords: form.customKeywords,
  }
}

async function handleTest() {
  try {
    await testWebhook(getFormData())
    addToast('success', t('settings.sendSuccess'))
  } catch (err: any) {
    addToast('error', err.message || t('toast.error'))
  }
}

async function handleRefreshPreview() {
  try {
    await fetchPreview(getFormData())
    const json = JSON.stringify(previewPayload.value, null, 2)
    generatedPayload.value = json
    editablePayload.value = json
  } catch (err: any) {
    addToast('error', err.message || t('toast.error'))
  }
}

async function handleInstantSend() {
  try {
    // Parse the edited payload and send it directly
    let payload: unknown
    try {
      payload = JSON.parse(editablePayload.value)
    } catch {
      addToast('error', t('settings.invalidJson'))
      return
    }
    await sendRawPayload(form.url, payload)
    addToast('success', t('settings.sendSuccess'))
  } catch (err: any) {
    addToast('error', err.message || t('toast.error'))
  }
}

function formatDate(iso: string) {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleString()
}

onMounted(async () => {
  await Promise.all([fetchConfig(), fetchHistory()])
  populateForm()
})
</script>

<style scoped>
.settings-view {
  max-width: 1080px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.settings-top-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: start;
}
.settings-card--left,
.settings-card--right {
  min-width: 0;
}
.settings-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.card-header {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.form-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
}
.form-hint {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
}
.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.filter-clear {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  padding: 0 2px;
  opacity: 0.6;
  transition: opacity 0.15s, color 0.15s;
}
.filter-clear:hover {
  opacity: 1;
  color: var(--accent-blue);
}
.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }

.url-row {
  display: flex;
  gap: 8px;
}
.url-input { flex: 1; }

.next-run {
  font-size: 12px;
  color: var(--text-muted);
}
.next-run-time {
  color: var(--accent-blue);
  font-weight: 500;
}

select[multiple] {
  min-height: 80px;
}

.save-row {
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 8px 20px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  transition: all 0.15s;
  border: none;
  cursor: pointer;
}
.btn-primary {
  background-color: var(--accent-blue);
  color: white;
}
.btn-primary:hover { opacity: 0.9; }
.btn-primary:disabled { opacity: 0.5; cursor: default; }

.btn-outline {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  white-space: nowrap;
}
.btn-outline:hover { background-color: var(--bg-tertiary); }
.btn-outline:disabled { opacity: 0.5; cursor: default; }

.empty-history {
  font-size: 13px;
  color: var(--text-muted);
  text-align: center;
  padding: 16px;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.history-table th {
  text-align: left;
  font-weight: 500;
  color: var(--text-muted);
  padding: 6px 8px;
  border-bottom: 1px solid var(--border-color);
  font-size: 12px;
}
.history-table td {
  padding: 6px 8px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-secondary);
}
.cell-time {
  font-size: 12px;
  white-space: nowrap;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}
.status-badge.success {
  background-color: rgba(63, 185, 80, 0.15);
  color: #3fb950;
}
.status-badge.error {
  background-color: rgba(248, 81, 73, 0.15);
  color: #f85149;
}

.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.btn-sm {
  padding: 4px 12px;
  font-size: 12px;
}

.payload-preview {
  flex: 1;
  min-height: 0;
  overflow: auto;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}
.payload-editor {
  width: 100%;
  min-height: 200px;
  max-height: 400px;
  padding: 12px;
  margin: 0;
  border: none;
  outline: none;
  resize: vertical;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 11px;
  line-height: 1.5;
  color: var(--text-secondary);
  background-color: transparent;
  white-space: pre;
  tab-size: 2;
  overflow: auto;
}
.payload-editor:focus {
  box-shadow: inset 0 0 0 1px var(--accent-blue);
  border-radius: var(--radius-md);
}
.payload-empty {
  padding: 32px 16px;
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
}
.payload-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}
.payload-edited-hint {
  font-size: 11px;
  color: var(--accent-blue);
  font-weight: 500;
}

.settings-card--right {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

@media (max-width: 768px) {
  .settings-top-row { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .form-row-2, .form-row-3 { grid-template-columns: 1fr; }
  .url-row { flex-direction: column; }
}
</style>
