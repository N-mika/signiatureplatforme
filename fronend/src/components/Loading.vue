<template>
  <div class="flex items-center justify-center p-8">
    <div class="flex flex-col items-center gap-3">
      <div class="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary"></div>

      <p class="text-sm font-medium text-gray-600">
        {{ text }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{ text?: string; }>(),
  {
    text: "Chargement..."
  }
);
</script>