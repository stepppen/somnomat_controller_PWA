<template>
    <UBadge  size="xl" :ui="{ base: 'font-medium inline-flex items-center pl-1 pr-2' }" :class="{'selectedMode': isActive}" class="rounded-full text-gray-500" color="secondary">
        <div class="bg-gray-200 rounded-full flex items-center justify-center p-2" :class="{'selectedIconContainer': isActive}">
            <Icon :name="badgeIcon" class="iconColor" :class="{'selectedIcon': isActive}"/>
        </div>
        {{ badgeText }}
    </UBadge>
</template>
<script setup lang="ts">
interface Props{
    badgeText?: string | null,
    badgeIcon?: string | null,
    isActive: boolean
    // badgeSelected: boolean;
}

defineProps<Props>()
</script>
<style scoped>

.selectedMode{
    box-sizing: border-box;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    -webkit-box-shadow:inset 0px 0px 0px 1px var(--gradient-end);
    -moz-box-shadow:inset 0px 0px 0px 1px var(--gradient-end);
    box-shadow:inset 0px 0px 0px 1px var(--gradient-end);
    /* box-shadow: 0px 0px 5px var(--gradient-end); */
    transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    /* border: 1px var(--gradient-start) solid; */
}
.selectedIconContainer{
    background-color: var(--gradient-end);
}
.selectedIcon{
    color: #ffffff;
    background-color: #ffffff;
}
</style>