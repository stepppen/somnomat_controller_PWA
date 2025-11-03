<template>
    <div>
        <MdiIcon v-if="navIcon" :icon="navIcon" size="24px" />
    </div>
</template>
<script setup lang="ts">
interface Props{
    navIcon?: String
}
defineProps<Props>()
</script>