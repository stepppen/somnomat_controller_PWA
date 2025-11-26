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
    <div class="main-container flex gap-2 badge-filter py-2">
        <PrimitivesFilterBadge :isActive="activeFilters.includes('relax')" badgeIcon="material-symbols:self-improvement-rounded" badgeText="Relax" @click="() => filterBy('relax')"/> 
        <PrimitivesFilterBadge :isActive="activeFilters.includes('nature')" badgeIcon="material-symbols:nest-eco-leaf-outline-rounded" badgeText="Nature" @click="() => filterBy('nature')" />
        <PrimitivesFilterBadge :isActive="activeFilters.includes('rain')" badgeIcon="material-symbols:rainy-outline" badgeText="Rain" @click="() => filterBy('rain')"/>
        <PrimitivesFilterBadge :isActive="activeFilters.includes('waves')" badgeIcon="material-symbols:waves" badgeText="Waves" @click="() => filterBy('waves')"/>
        <PrimitivesFilterBadge :isActive="activeFilters.includes('forest')" badgeIcon="material-symbols:forest-outline-rounded" badgeText="Forest" @click="() => filterBy('forest')"/>
    </div>
    <div class="main-container grid grid-cols-2">
        <primitives-container class="w-full h-full flex flex-col">
            <div>
                <p>Sound 01</p>
            </div>
            <div class=" w-full flex justify-end">
                <button class="bg-slate-200 active:bg-slate-300 py-3 rounded font-medium transition w-16" @click="playBack">
                    Play Sound 
                </button>
            </div>
        </primitives-container>
    </div>
</template>

<script setup>
const activeFilters = ref([])

function filterBy(filter) {
  const index = activeFilters.value.indexOf(filter)
  if (index > -1) {
    activeFilters.value.splice(index, 1)
  } else {
    activeFilters.value.push(filter)
  }
}

// function filterRelax(value){
//     console.log('Toggle value:', value);
//     setFilter(value ? "on" : "off");
// }
// function setFilter(cmd) {
//     console.log("command:", cmd)
// }

</script>
<style scoped>
.badge-filter{
    overflow-x: scroll;
    flex-shrink: 0
    /* min-width: fit-content; */
}
</style>