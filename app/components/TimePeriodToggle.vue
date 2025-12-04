<script setup lang="ts">
defineProps<{
  modelValue: 'AM' | 'PM'
  label: string
}>()

defineEmits<{
  (e: 'update:modelValue', value: 'AM' | 'PM'): void
}>()
</script>

<template>
  <div class="flex flex-col items-center gap-2">
    <span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ label }}</span>
    <button 
      @click="$emit('update:modelValue', modelValue === 'AM' ? 'PM' : 'AM')"
      class="relative flex w-16 items-center rounded-full bg-gray-200 p-1 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-gray-700"
      :class="{ 'bg-indigo-100 dark:bg-indigo-900': modelValue === 'PM' }"
    >
      <span class="sr-only">Toggle AM/PM</span>
      <span
        class="inline-block h-6 w-7 transform rounded-full bg-white text-[10px] font-bold leading-6 text-center text-gray-900 shadow ring-0 transition duration-200 ease-in-out"
        :class="modelValue === 'PM' ? 'translate-x-8' : 'translate-x-0'"
      >
        {{ modelValue }}
      </span>
    </button>
  </div>
</template>