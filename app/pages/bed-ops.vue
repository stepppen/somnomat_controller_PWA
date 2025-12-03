<template>
        <div class="main-container py-4 flex justify-between w-full">
            <div>
                <h2 class="text-left">Bed Operation</h2>
            </div>
            <div class="flex gap-4">
                <div class="nav-button"
                @click="navigateTo('/')">
                    <Icon name="material-symbols:settings-outline-rounded" size="1.5em"/>
                </div>
                <div class="nav-button"
                @click="navigateTo('/notifications')">
                    <Icon name="material-symbols:notifications-outline-rounded" size="1.5em"/>
                </div>
            </div>
            
        </div>
        <div class="flex flex-col gap-4">
            <div class="main-container w-full flex justify-center pt-16">
                <div class="flex flex-col gap-2 align-items-center justify-center">
                    <div v-if="globalTargetDevice">
                        <h3 class="text-xl font-bold">{{ globalDeviceName || 'Unnamed Device' }}</h3>
                    </div>
                    <div class="flex justify-center gap-2">
                        <span v-if="globalTargetDevice" :class="['px-2 py-1 rounded-full text-(--gradient-start) text-xs font-medium',
                                    globalTargetDevice.status === 'online' ? 'online' : 'bg-gray-300']">
                            <p class="p-small">
                                {{ globalTargetDevice.status || 'offline' }}
                            </p>
                        </span>
                          <USwitch
                            v-model="isOn"
                            unchecked-icon="material-symbols:mode-off-on"
                            checked-icon="material-symbols:mode-off-on"
                            size="xl"
                            color="primary"
                            @update:modelValue="handleToggle"
                            default-value
                        />
                    </div>
                </div>
            </div>
            <div class="main-container w-full flex justify-center pt-16">
                <div class="flex flex-col gap-1 w-3/4 opacity-20">
                    <div class="h-5 w-14 rounded-full bg-(--gradient-start)"></div>
                    <div class="h-8 w-full rounded-t-xl bg-(--gradient-start)"> </div>
                    <div class="h-4 w-full bg-(--gradient-start)"> </div>
                    <div class="flex justify-between px-4">
                        <div class="h-4 w-4 bg-(--gradient-start)"></div>
                        <div class="h-4 w-4 bg-(--gradient-start)"></div>
                    </div>
                </div>
            </div>
            <div class="main-container flex flex-col gap-4" >
                        <!-- Control Panel -->
                         <primitives-container>
                            <div class="flex flex-col gap-2">
                                <div class="flex flex-col gap-2">
                                    <div class="flex w-full justify-between">
                                        <h3>Intensity</h3>
                                        <div class="flex gap-1">
                                            <h3>
                                                {{ valueIntensity }}
                                            </h3>
                                            <h3 class="opacity-40">
                                                 / 8
                                            </h3>
                                        </div>
                                    </div>
                                    <USlider color="primary" @mouseup="sendIntensity()" @touchend="sendIntensity()" :disabled="!isOn" class="custom-sider" size="xl" v-model="valueIntensity" :step="1" :min="0" :max="8" :ui="{ 
                                        root: isOn ? '' : 'opacity-25',
                                        thumb: 'rounded-full bg-primary ring-0 border-4 px-2 py-3 border-white focus-visible:py-4 focus-visible:outline-0 focus-visible:outline-offset-0',
                                        track: 'relative bg-accented overflow-hidden rounded-full grow h-4'}"/>
                                </div>
                                <div class="flex flex-col gap-2">
                                    <div class="flex w-full justify-between">
                                        <h3>Vibration</h3>
                                        <div class="flex gap-1">
                                            <h3>
                                                {{ valueVibration }}
                                            </h3>
                                            <h3 class="opacity-40">
                                                 / 8
                                            </h3>
                                        </div>
                                    </div>
                                    <USlider :disabled="!isOn" class="custom-sider" @mouseup="sendVibration()" @touchend="sendVibration()" size="xl" v-model="valueVibration" :step="1" :min="0" :max="8" :ui="{ 
                                        root: isOn ? '' : 'opacity-25',
                                        thumb: 'rounded-full bg-primary ring-0 border-4 px-2 py-3 border-white focus-visible:py-4 focus-visible:outline-0 focus-visible:outline-offset-0',
                                        track: 'relative bg-accented overflow-hidden rounded-full grow h-4'}"/>
                                </div>
                            </div>
                         </primitives-container>
                         <PrimitivesFullButton class="p-4" buttonPath="/meditation" navIcon="material-symbols:spa-outline-rounded" buttonText="Meditation Mode"/>
                </div>
    
                
        </div>
</template>

<script setup>
const { 
  globalDeviceId,
  globalDeviceName,
  globalTargetDevice,
  globalDeviceSettings,
  isOn,
  loadDeviceData,
  loadDeviceSettings,
  sendCommand
} = useDevice()

const valueIntensity = ref(0);
const valueVibration = ref(0);
let refreshInterval = null;

// Lifecycle
onMounted(async () => {
    console.log("Global device ID on mount:", globalDeviceId.value)
    document.body.style.overflow = 'hidden'
    if (globalDeviceId.value) {
        await loadDeviceData()
        await loadDeviceSettings()
        if (globalDeviceSettings.value) {
            valueIntensity.value = globalDeviceSettings.value.intensity ?? 0;
            valueVibration.value = globalDeviceSettings.value.vibration ?? 0;
            console.log("with motor status: ", globalDeviceSettings.value.motor_status)
        }
        console.log("global target device: ", globalTargetDevice.value)
        
        
        refreshInterval = setInterval(async () => {
            await loadDeviceData()
            await loadDeviceSettings()
        }, 30000);
    }
    
    // Load saved bedtime preference
    // const saved = localStorage.getItem('targetBedtime');
    // if (saved) targetBedtime.value = saved;
});

onUnmounted(() => {
    document.body.style.overflow = ''
    if (refreshInterval) clearInterval(refreshInterval);
});

watch(globalDeviceId, async (newId) => {
    if (newId) {
        await loadDeviceData();
    }
});



function sendVibration() { 
    sendCommand("vibration_".concat((valueVibration.value).toString()))
}

function sendIntensity() { 
    sendCommand("intensity_".concat((valueIntensity.value).toString()))
    console.log("intensity_".concat((valueIntensity.value).toString()))
}

function handleToggle(value){
    isOn.value = value
    console.log('Toggle value:', value);
    sendCommand(value ? "on" : "off");
}
</script>

<style scoped>
.online{
    background-color: var(--light-blue);
}

.custom-sider :deep(.slider-track){ 
    background: var(--ui-neutral);
}

</style>