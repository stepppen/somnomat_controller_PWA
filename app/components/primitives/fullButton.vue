<template>
    <div class="wide-button p-4 rounded-2xl">
        <div class="flex justify-between align-items-center w-full">
            <div class="flex gap-2 align-items-center">
                <div class="bg-color-red rounded-full">
                    <Icon :name="navIcon" style="color: black" size="2em"/>
                </div>
                <p>{{ buttonText }}</p>
            </div>
            <div>
                <Icon name="material-symbols:arrow-forward-ios-rounded" style="color: black" size="1.5em"/>
            </div>
        </div>
        <slot></slot>
    </div>
</template>
<script setup lang="ts">
interface Props{
    navIcon?: String | undefined,
    buttonText?: String,
    sizeIcon?: Number | undefined
}
defineProps<Props>()



</script>

<style scoped>
.wide-button {
    background-color: white;
    padding: 1rem;
}
.wide-button:active {
    background-color: grey;
}

</style>