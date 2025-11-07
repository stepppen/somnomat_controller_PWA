<template>
    <div class="w-full flex justify-center bg-white rounded-t-lg shadow-lg  border-1 border-white border-t-gray-200">
        <div class="flex gap-2 max-w-full">
            <NuxtLink to="/bed-ops" class="action-btn">
                <NavButton navIcon="mdiBedKingOutline"/>
            </NuxtLink>
            <NuxtLink to="/" class="action-btn text-xs">
                <NavButton navIcon="mdiHomeVariantOutline"/>
            </NuxtLink>
            <NuxtLink to="/settings" class="action-btn text-xs py-2">
                <NavButton navIcon="mdiAccountOutline"/>
            </NuxtLink>
        </div>
    </div>
</template>

<script>

</script>