<template>
    <div class="w-full flex justify-center bg-white rounded-t-lg shadow-lg border-1 border-white border-t-gray-200 pb-4">
        <div class="flex gap-2 max-w-full">
            <NuxtLink to="/bed-ops">
                <NavButton navIcon="mdiBedKingOutline"/>
            </NuxtLink>
            <NuxtLink to="/" >
                <NavButton navIcon="mdiHomeVariantOutline"/>
            </NuxtLink>
            <NuxtLink to="/settings">
                <NavButton navIcon="mdiAccountOutline"/>
            </NuxtLink>
        </div>
    </div>
</template>

<script>

</script>