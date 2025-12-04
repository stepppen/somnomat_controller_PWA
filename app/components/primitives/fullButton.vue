<template>
    <div class="wide-button p-2 rounded-2xl" @click="navigateTo(buttonPath)">
        <div class="flex justify-between items-center w-full">
            <div class="flex gap-2 items-center justify-center">
                <div class="bg-[#F2F3FC] rounded-xl p-2 flex align-items-center justify-center">
                    <Icon :name="navIcon" class="iconColor" size="1.5em"/>
                </div>
                <p class="align-bottom">{{ buttonText }}</p>
            </div>
            <div>
                <Icon name="material-symbols:arrow-forward-ios-rounded" class="iconColor" size="1em"/>
            </div>
        </div>
        <slot></slot>
    </div>
</template>
<script setup lang="ts">
interface Props{
    navIcon?: string | undefined,
    buttonText?: string,
    buttonPath?: string,
    sizeIcon?: Number | undefined
}
defineProps<Props>()



</script>

<style scoped>
.wide-button {
    background-color: white;
    padding-top: 0.8rem;
    padding-bottom: 0.8rem;
}
.wide-button:active {
    background-color: rgb(236, 236, 236);
}


</style>