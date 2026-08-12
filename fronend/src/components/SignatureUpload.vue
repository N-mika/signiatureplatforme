<script setup lang="ts">
import { computed, ref } from 'vue'
import { Upload, X, FileSignature } from 'lucide-vue-next'

interface Props {
  label: string
  role: 'president' | 'member'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  change: [file: File | null]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const file = ref<File | null>(null)
const preview = ref<string | null>(null)

const isImage = computed(() => {
  return file.value?.type.startsWith('image/') ?? false
})

const openFilePicker = () => {
  inputRef.value?.click()
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement

  if (!target.files || target.files.length === 0) {
    return
  }

  const selectedFile = target.files[0]

  if (!selectedFile.type.startsWith('image/')) {
    return
  }

  file.value = selectedFile

  if (preview.value) {
    URL.revokeObjectURL(preview.value)
  }

  preview.value = URL.createObjectURL(selectedFile)

  emit('change', selectedFile)
}

const removeFile = () => {
  file.value = null

  if (preview.value) {
    URL.revokeObjectURL(preview.value)
    preview.value = null
  }

  if (inputRef.value) {
    inputRef.value.value = ''
  }

  emit('change', null)
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <FileSignature :size="20" class="text-primary" />

        <div class="flex flex-col">
          <span class="text-sm font-semibold text-gray-800">
            {{ label }}
          </span>

          <span class="text-xs text-gray-500">
            Signature du {{ role === 'president' ? 'président' : 'membre' }}
          </span>
        </div>
      </div>

      <button v-if="file" type="button"
        class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500"
        @click="removeFile">
        <X :size="18" />
      </button>
    </div>

    <input ref="inputRef" type="file" accept="image/png,image/jpeg,image/webp" class="hidden"
      @change="handleFileChange" />

    <!-- Upload -->
    <button v-if="!file" type="button"
      class="flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 transition hover:border-primary hover:bg-primary/5"
      @click="openFilePicker">
      <div class="flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary shadow-sm">
        <Upload :size="22" />
      </div>

      <div class="flex flex-col items-center gap-1">
        <span class="text-sm font-medium text-gray-700">
          Importer la signature
        </span>

        <span class="text-xs text-gray-400">
          PNG, JPG ou WEBP
        </span>
      </div>
    </button>

    <!-- Preview -->
    <div v-else class="flex min-h-40 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-5">
      <img v-if="isImage && preview" :src="preview" :alt="`Signature ${label}`"
        class="max-h-28 max-w-full object-contain" />
    </div>
  </div>
</template>