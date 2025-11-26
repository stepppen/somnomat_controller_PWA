<template>
    <div class="main-container py-4 flex justify-between w-full">
        <div class="nav-button"
            @click="navigateTo('/bed-ops')">
                <Icon name="material-symbols:arrow-back-ios-rounded" size="1.5em"/>
            </div>
        <div class="flex gap-4">
            <div class="nav-button"
            @click="navigateTo('/')">
                <Icon name="material-symbols:settings-outline-rounded" size="1.5em"/>
            </div>
            <div class="nav-button"
            @click="navigateTo('/')">
                <Icon name="material-symbols:notifications-outline-rounded" size="1.5em"/>
            </div>
        </div>
    </div>
    <div class="main-container w-full flex justify-center py-8">
        <div class="flex flex-col gap-2 align-items-center justify-center">
            <div>
                <h3 class="text-xl font-bold">Sounds</h3>
            </div>
        </div>
    </div>
    <div class="main-container flex gap-2 badge-filter">
        <PrimitivesFilterBadge v-model="RelaxSelected" badgeIcon="material-symbols:self-improvement-rounded" badgeText="Relax" @click="filterBy()"/> 
        <PrimitivesFilterBadge badgeIcon="material-symbols:nest-eco-leaf-outline-rounded" badgeText="Nature" />
        <PrimitivesFilterBadge badgeIcon="material-symbols:rainy-outline" badgeText="Rain" />
        <PrimitivesFilterBadge badgeIcon="material-symbols:waves" badgeText="Waves" />
        <PrimitivesFilterBadge badgeIcon="material-symbols:forest-outline-rounded" badgeText="Forest" />
    </div>
    <div class="main-container ">
        <primitives-container>
                <button class="bg-slate-200 active:bg-slate-300 py-3 rounded font-medium transition" @click="playBack">
                Play Sound 
            </button>
                <button
                        class="bg-slate-200 active:bg-slate-300 py-3 rounded-2xl font-medium transition">
                    Meditation
                </button>
        </primitives-container>
    </div>
</template>

<script setup>
const RelaxSelected = ref(false)
function filterBy(){

}

</script>
<style scoped>
.badge-filter{
    overflow-x: scroll;
    flex-shrink: 0
    /* min-width: fit-content; */
}
</style>