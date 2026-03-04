<template>
  <Transition name="modal">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3 class="modal-title">{{ defect ? t('form.editDefect') : t('form.createDefect') }}</h3>
          <button class="close-btn" @click="$emit('close')">&#10005;</button>
        </div>

        <form class="defect-form" @submit.prevent="handleSubmit">
          <!-- Title -->
          <div class="form-group">
            <label class="form-label">{{ t('defect.title') }} <span class="required">*</span></label>
            <input class="input-base" v-model="form.title" :placeholder="t('form.titlePlaceholder')" required />
          </div>

          <!-- Row: Severity + Priority + Status -->
          <div class="form-row-3">
            <div class="form-group">
              <label class="form-label">{{ t('defect.severity') }}</label>
              <select class="input-base" v-model="form.severity">
                <option v-for="s in SEVERITIES" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">{{ t('defect.priority') }}</label>
              <select class="input-base" v-model="form.priority">
                <option v-for="p in PRIORITIES" :key="p" :value="p">{{ p }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">{{ t('defect.status') }}</label>
              <select class="input-base" v-model="form.status">
                <option v-for="s in STATUSES" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
          </div>

          <!-- Row: Category + Phase -->
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">{{ t('defect.category') }}</label>
              <select class="input-base" v-model="form.category">
                <option v-for="c in CATEGORIES" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">{{ t('defect.detectedPhase') }}</label>
              <select class="input-base" v-model="form.detectedPhase">
                <option v-for="p in DETECTED_PHASES" :key="p" :value="p">{{ p }}</option>
              </select>
            </div>
          </div>

          <!-- Row: Vehicle + Product + Layer + Component -->
          <div class="form-row-4">
            <div class="form-group">
              <label class="form-label">{{ t('defect.vehicle') }}</label>
              <select class="input-base" v-model="form.vehicle">
                <option value="">-</option>
                <option v-for="v in VEHICLE_OPTIONS" :key="v" :value="v">{{ v }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">{{ t('defect.product') }}</label>
              <select class="input-base" v-model="form.product">
                <option value="">-</option>
                <option v-for="p in PRODUCT_OPTIONS" :key="p" :value="p">{{ p }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">{{ t('defect.layer') }}</label>
              <select class="input-base" v-model="form.layer">
                <option value="">-</option>
                <option v-for="l in LAYER_OPTIONS" :key="l" :value="l">{{ l }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">{{ t('defect.component') }}</label>
              <input class="input-base" v-model="form.component" :placeholder="t('form.componentPlaceholder')" list="component-list" />
              <datalist id="component-list">
                <option v-for="c in DEFAULT_COMPONENT_OPTIONS" :key="c" :value="c" />
              </datalist>
            </div>
          </div>

          <!-- Row: Reporter + Assignee -->
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">{{ t('defect.reporter') }} <span class="required">*</span></label>
              <AssigneeCombobox
                :modelValue="reporterId"
                @update:modelValue="reporterId = $event"
                :items="allMembers"
                :selectedName="reporterName"
                :placeholder="t('form.searchAssignee')"
                :groupLabel="t('defect.reporter')"
                :resultsLabel="t('form.results')"
                :noResultsLabel="t('form.noResults')"
              />
            </div>
            <div class="form-group">
              <label class="form-label">{{ t('defect.assignee') }}</label>
              <AssigneeCombobox
                :modelValue="assigneeId"
                @update:modelValue="assigneeId = $event"
                :items="allMembers"
                :selectedName="assigneeName"
                :placeholder="t('form.searchAssignee')"
                :groupLabel="t('defect.assignee')"
                :resultsLabel="t('form.results')"
                :noResultsLabel="t('form.noResults')"
              />
            </div>
          </div>

          <!-- Description -->
          <DescriptionEditor v-model="form.description" />

          <!-- Root Cause + Corrective Action -->
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">{{ t('defect.rootCause') }}</label>
              <textarea class="input-base textarea" v-model="form.rootCause" :placeholder="t('form.rootCausePlaceholder')" rows="2"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">{{ t('defect.correctiveAction') }}</label>
              <textarea class="input-base textarea" v-model="form.correctiveAction" :placeholder="t('form.correctiveActionPlaceholder')" rows="2"></textarea>
            </div>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <button type="button" class="btn btn-ghost" @click="$emit('close')">{{ t('form.cancel') }}</button>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? '...' : (defect ? t('form.update') : t('form.create')) }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from '@/i18n'
import { useDefects } from '@/composables/useDefects'
import { useToast } from '@/composables/useToast'
import { SEVERITIES, PRIORITIES, STATUSES, CATEGORIES, DETECTED_PHASES, VEHICLE_OPTIONS, PRODUCT_OPTIONS, LAYER_OPTIONS, DEFAULT_COMPONENT_OPTIONS } from '@/config/constants'
import { TEAM_MEMBERS } from '@/config/projects'
import type { Defect } from '@/types/api'
import AssigneeCombobox from '@/components/form/AssigneeCombobox.vue'
import DescriptionEditor from '@/components/form/DescriptionEditor.vue'

const props = defineProps<{ defect: Defect | null }>()
const emit = defineEmits<{ save: []; close: [] }>()

const { t } = useI18n()
const { addToast } = useToast()
const { createDefect, updateDefect } = useDefects()

const isSubmitting = ref(false)

const allMembers = computed(() => {
  const all: typeof TEAM_MEMBERS[keyof typeof TEAM_MEMBERS] = []
  for (const members of Object.values(TEAM_MEMBERS)) {
    for (const m of members) {
      if (!all.some(a => a.id === m.id)) all.push(m)
    }
  }
  return all
})

const form = reactive({
  title: props.defect?.title || '',
  description: props.defect?.description || '',
  severity: props.defect?.severity || 'Minor',
  priority: props.defect?.priority || 'P2',
  status: props.defect?.status || 'Open',
  category: props.defect?.category || 'Other',
  detectedPhase: props.defect?.detectedPhase || 'Design',
  vehicle: props.defect?.vehicle || '',
  product: props.defect?.product || '',
  layer: props.defect?.layer || '',
  component: props.defect?.component || '',
  rootCause: props.defect?.rootCause || '',
  correctiveAction: props.defect?.correctiveAction || '',
})

const reporterId = ref(props.defect?.reporterId || '')
const assigneeId = ref(props.defect?.assigneeId || '')

const reporterName = computed(() => allMembers.value.find(m => m.id === reporterId.value)?.name || '')
const assigneeName = computed(() => allMembers.value.find(m => m.id === assigneeId.value)?.name || '')

async function handleSubmit() {
  if (!form.title || !reporterId.value) return

  isSubmitting.value = true
  try {
    const payload = {
      ...form,
      reporterId: reporterId.value,
      reporterName: reporterName.value,
      assigneeId: assigneeId.value,
      assigneeName: assigneeName.value,
    }

    if (props.defect) {
      await updateDefect(props.defect.id, payload)
      addToast('success', t('toast.updateSuccess'))
    } else {
      await createDefect(payload)
      addToast('success', t('toast.createSuccess'))
    }
    emit('save')
  } catch (err: any) {
    addToast('error', err.message || t('toast.error'))
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 5000;
  padding: 40px 24px;
  overflow-y: auto;
}
.modal-content {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-modal);
  padding: 24px;
  max-width: 720px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: scaleIn 0.2s ease-out;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}
.close-btn {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-muted);
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.close-btn:hover {
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
}
.defect-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
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
.required {
  color: var(--accent-red);
}
.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
.form-row-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; }
.textarea {
  resize: vertical;
  min-height: 60px;
  font-family: var(--font-sans);
  line-height: 1.5;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 8px;
}
.btn {
  padding: 8px 20px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  transition: all 0.15s;
  border: none;
}
.btn-ghost {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}
.btn-ghost:hover { background-color: var(--bg-tertiary); }
.btn-primary {
  background-color: var(--accent-blue);
  color: white;
}
.btn-primary:hover { opacity: 0.9; }
.btn-primary:disabled { opacity: 0.5; }

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@media (max-width: 640px) {
  .form-row-2, .form-row-3, .form-row-4 { grid-template-columns: 1fr; }
}
</style>
