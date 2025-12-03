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
    <div v-if="filteredSounds.length > 0" class="main-container grid grid-cols-2 pt-8 " :class="{'disableGrid': !isOn}">
        <primitives-container v-for="sound in filteredSounds" :key="sound.id" class="w-full h-full flex flex-col gradient-bg">
            <div>
                <p class="text-white">{{sound.name}}</p>
            </div>
            <div class=" w-full flex justify-between">
                <div class="">

                </div>
                <button class="play-button-bg p-2 rounded-2xl font-medium transition h-12 w-12" @click="() => playBack(sound.id)">
                    <Icon v-if="isPlaying" name="material-symbols:stop-outline-rounded" class="text-white" size="2em"/>
                    <Icon v-else name="material-symbols:play-arrow-outline-rounded" class="text-white" size="2em"/>
                </button>
            </div>
        </primitives-container>
    </div>
    
    <div v-else class="empty-state">
        <p class="text-gray-500">No sounds found</p>
    </div>
</template>

<script setup>
const { 
  globalDeviceId,
  isOn,
  loadDeviceData,
  sendCommand,
} = useDevice()


const isPlaying = ref(false)
let refreshInterval = null;
const activeFilters = ref([])
let audio = ref(null)

const sounds = ref([
  { id: 1, type: "rain", name: 'Rain 01', file: '/audio/example.wav' }
])

const filteredSounds = computed(() => {
      console.log('sounds:', sounds.value)
  console.log('selectedFilter:', activeFilters.value)
  if (activeFilters.value.length === 0) {
    return sounds.value
  }
  return sounds.value.filter(sound => 
    activeFilters.value.includes(sound.type)
  )
})



function filterBy(filter) {
  const index = activeFilters.value.indexOf(filter)
  if (index > -1) {
    activeFilters.value.splice(index, 1)
  } else {
    activeFilters.value.push(filter)
  }
}

function playBack(soundId){
    if (!isOn.value){ 
        return;
    }
    // Grab sound using: sounds.soundId
    let rightSound = ""

    for (let i = 0; i < sounds.value.length; i++){ 
        if(sounds.value[i].id === soundId){ 
            rightSound = sounds.value[i].file
            // console.log("wooo: ", rightSound)
        }
    }
    // const soundPath = rightSound.path
    // const soundPath = sounds.value.filter(sound => activeFilters.value.includes(sound.id))
    
    if (isPlaying.value){
        isPlaying.value = !isPlaying.value
        console.log("Audio paused manually State: ", isPlaying.value)
        audio.pause()
        audio.load()
        sendCommand("on")
    }
    else { 
        audio = new Audio(rightSound)
        sendCommand("meditation")
        isPlaying.value = !isPlaying.value
        console.log("State: ", isPlaying.value)
        audio.volume = 0.25
        audio.addEventListener('ended', () => {
            isPlaying.value = !isPlaying.value
            console.log("Audio finished, State: ", isPlaying.value)
            sendCommand("on")
        })
        audio.play()
    }

}

// Lifecycle
onMounted(async () => {
    if (globalDeviceId.value) {
            await loadDeviceData()
            
            refreshInterval = setInterval(async () => {
                await loadDeviceData()
            }, 30000);
        }
});

onUnmounted(() => {
    if (refreshInterval) clearInterval(refreshInterval);
});
</script>


<style scoped>
.badge-filter{
    overflow-x: scroll;
    flex-shrink: 0
    /* min-width: fit-content; */
}

.empty-state{
    width: 100%;
    display: flex;
    justify-content: center;
    padding-top: 2rem;
}

.gradient-bg{
    background: linear-gradient(90deg,var(--gradient-start) 0%, var(--gradient-end) 80%);
}

.play-button-bg{
    background-color: rgba(0, 0, 0, 0.2);
}

.disableGrid{
    opacity: 0.25;
}
</style>