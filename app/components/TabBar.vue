<template>
    <div class="w-full flex justify-center bg-white rounded-full">
        <div class="flex gap-2 max-w-full">
            <NuxtLink to="/remote-config" class="action-btn text-xs py-2">
                <NavButton navIcon="mdiRemote"/>
            </NuxtLink>
            <NuxtLink to="/" class="action-btn text-xs">
                <NavButton navIcon="mdiHomeVariantOutline"/>
            </NuxtLink>
            <NuxtLink to="/bed-ops" class="action-btn text-xs">
                <NavButton navIcon="mdiBedKingOutline"/>
            </NuxtLink>
        </div>
    </div>
</template>

<script>

</script>