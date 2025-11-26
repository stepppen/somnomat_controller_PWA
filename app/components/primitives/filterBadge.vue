<template>
    <UBadge  size="xl" :ui="{ base: 'font-medium inline-flex items-center px-1' }" class="rounded-full text-gray-500" color="secondary">
        <div class="bg-gray-200 rounded-full flex items-center justify-center p-2">
            <Icon :name="badgeIcon" class="iconColor"/>
        </div>
        {{ badgeText }}
    </UBadge>
</template>
<script setup lang="ts">
interface Props{
    badgeText?: string | null;
    badgeIcon?: string | null;
    // badgeSelected: boolean;
}

defineProps<Props>()
</script>
<style scoped>
</style>