import { ref } from 'vue'
import { useApi } from './useApi'
import type { WebhookConfig, WebhookConfigInput, WebhookPreviewInput, WebhookHistoryEntry } from '@/types/api'

const { request } = useApi()

export function useWebhook() {
  const config = ref<WebhookConfig | null>(null)
  const history = ref<WebhookHistoryEntry[]>([])
  const isLoading = ref(false)
  const isTesting = ref(false)
  const testResult = ref<WebhookHistoryEntry | null>(null)

  async function fetchConfig() {
    isLoading.value = true
    try {
      config.value = await request<WebhookConfig>('/webhook/config')
    } finally {
      isLoading.value = false
    }
  }

  async function saveConfig(input: WebhookConfigInput) {
    isLoading.value = true
    try {
      config.value = await request<WebhookConfig>('/webhook/config', {
        method: 'PUT',
        body: input,
      })
    } finally {
      isLoading.value = false
    }
  }

  async function testWebhook(formData?: Partial<WebhookConfigInput>) {
    isTesting.value = true
    testResult.value = null
    try {
      testResult.value = await request<WebhookHistoryEntry>('/webhook/test', {
        method: 'POST',
        body: formData || {},
      })
      await fetchHistory()
    } finally {
      isTesting.value = false
    }
  }

  const previewPayload = ref<Record<string, unknown> | null>(null)
  const isPreviewing = ref(false)

  async function fetchPreview(formData?: WebhookPreviewInput) {
    isPreviewing.value = true
    try {
      previewPayload.value = await request<Record<string, unknown>>('/webhook/preview', {
        method: 'POST',
        body: formData || {},
      })
    } finally {
      isPreviewing.value = false
    }
  }

  async function sendRawPayload(url: string, payload: unknown) {
    isTesting.value = true
    try {
      testResult.value = await request<WebhookHistoryEntry>('/webhook/send-raw', {
        method: 'POST',
        body: { url, payload },
      })
      await fetchHistory()
    } finally {
      isTesting.value = false
    }
  }

  async function fetchHistory() {
    history.value = await request<WebhookHistoryEntry[]>('/webhook/history')
  }

  return { config, history, isLoading, isTesting, isPreviewing, testResult, previewPayload, fetchConfig, saveConfig, testWebhook, sendRawPayload, fetchPreview, fetchHistory }
}
