<template>
    <div class="w-full wide-button p-2 rounded-2xl" @click="navigateTo(buttonPath)">
        <div class="flex justify-center items-center w-full">
            <h2 class="text-center">{{ buttonText }}</h2>
        </div>
        <slot></slot>
    </div>
</template>
<script setup lang="ts">
interface Props{
    buttonText?: string,
    buttonPath?: string,
}
defineProps<Props>()
</script>

<style scoped>
.wide-button {
    background-color: var(--primary-contrast);
    padding-top: 0.8rem;
    padding-bottom: 0.8rem;
    color: white;
}
.wide-button:active {
    background-color: rgb(74, 74, 74);
}


</style>