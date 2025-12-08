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
            
        <div v-if="activateSafety" class="main-container">
            <div class="text-sm mt-2 bg-gray-200 rounded-2xl p-2 flex items-center justify-center gap-2">
                <Icon name="material-symbols:info-outline-rounded" size="1em"/>
                <p class="p-small text-center">
                    Safety mode is on
                </p>
            </div>
        </div>   
        <div v-if="motorError" class="main-container">
            <div class="text-sm mt-2 bg-gray-200 rounded-2xl p-2 flex items-center justify-center gap-2">
                <Icon name="material-symbols:info-outline-rounded" size="1em"/>
                <p class="p-small text-center">
                    Motor Error
                </p>
            </div>
        </div>  
        <div class="flex flex-col gap-4">
            <div class="main-container w-full flex justify-center pt-16">
                <div class="flex flex-col gap-2 align-items-center justify-center">
                    <div v-if="globalTargetDevice">
                        <h3 class="text-xl font-bold">{{ globalTargetDevice.name || 'Unnamed Device' }}</h3>
                    </div>
                    <div v-else>
                        <h3 class="text-xl font-bold">No Device Found</h3>
                    </div>
                    <div class="flex justify-center gap-2">
                        <span v-if="globalTargetDevice" class="online px-2 py-1 rounded-full text-(--gradient-start) text-xs font-medium">
                            <p class="p-small">
                                online
                            </p>
                        </span>
                        <span v-else class="px-2 py-1 rounded-full text-black text-xs font-medium bg-gray-200">
                            <p class="p-small">
                                offline
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
                <div class="flex flex-col gap-1 w-3/4 opacity-20" :class="{'bedTurnedOnColor': isOn}">
                    <!-- Pillow and Mattress (animated) -->
                    <div class="bed-moving-part flex flex-col gap-1"
                        :class="{
                            'bed-animating': isOn && valueIntensity > 0,
                            'bed-intensity-0': valueIntensity === 0,
                            'bed-intensity-1': valueIntensity === 1,
                            'bed-intensity-2': valueIntensity === 2,
                            'bed-intensity-3': valueIntensity === 3,
                            'bed-intensity-4': valueIntensity === 4,
                            'bed-intensity-5': valueIntensity === 5,
                            'bed-intensity-6': valueIntensity === 6,
                            'bed-intensity-7': valueIntensity === 7,
                            'bed-intensity-8': valueIntensity === 8,
                        }">
                        <div class="h-5 w-14 rounded-full bg-(--primary-contrast)" :class="{'inactiveColor': !globalTargetDevice}"></div>
                        <div class="h-8 w-full rounded-t-xl bg-(--primary-contrast)" :class="{'inactiveColor': !globalTargetDevice}"></div>
                    </div>

                    <div class="h-4 w-full bg-(--primary-contrast)" :class="{'inactiveColor': !globalTargetDevice}"></div>
                    <div class="flex justify-between px-4">
                        <div class="h-4 w-4 bg-(--primary-contrast)" :class="{'inactiveColor': !globalTargetDevice}"></div>
                        <div class="h-4 w-4 bg-(--primary-contrast)" :class="{'inactiveColor': !globalTargetDevice}"></div>
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
                                    <USlider color="primary" @mouseup="sendIntensity()" @touchend="sendIntensity()" :disabled="!isOn" class="custom-sider" :class="{'inactiveSlider': globalTargetDevice}"  size="xl" v-model="valueIntensity" :step="1" :min="0" :max="8" :ui="{ 
                                        root: isOn ? '' : 'opacity-25',
                                        thumb: globalTargetDevice ? '' : 'bg-[#9ca3af]',
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
                                    <USlider :disabled="!isOn" class="custom-sider" :class="{'inactiveSlider': !globalTargetDevice}" @mouseup="sendVibration()" @touchend="sendVibration()" size="xl" v-model="valueVibration" :step="1" :min="0" :max="8" :ui="{ 
                                        root: isOn ? '' : 'opacity-25',
                                        thumb: globalTargetDevice ? '' : 'bg-[#9ca3af]',
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
  isSafety,
  isMotorError,
  isOn,
  pendingCommands,
  lastCommandTime,
  loadDeviceData,
  loadDeviceSettings,
  sendCommand
} = useDevice()

const valueIntensity = ref(0);
const valueVibration = ref(0);
let refreshInterval = null;
let settingsCheckInterval = null;
let activateSafety = ref(false)
let motorError = ref(false)

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
            console.log("with safety: ", globalTargetDevice.value.safety)
            console.log("isSafety: ", isSafety.value)
            //need a computed value?
            activateSafety.value = isSafety.value
            motorError.value = isMotorError.value
        }
        console.log("global target device: ", globalTargetDevice.value)

        //remote control polling 
        settingsCheckInterval = setInterval(async () => {
            if (pendingCommands.value.size === 0) {
                await loadDeviceSettings(true);
                if (globalDeviceSettings.value) {
                    if (valueIntensity.value !== globalDeviceSettings.value.intensity) {
                        console.log("Intensity changed remotely:", globalDeviceSettings.value.intensity);
                        valueIntensity.value = globalDeviceSettings.value.intensity ?? 0;
                    }
                    if (valueVibration.value !== globalDeviceSettings.value.vibration) {
                        console.log("Vibration changed remotely:", globalDeviceSettings.value.vibration);
                        valueVibration.value = globalDeviceSettings.value.vibration ?? 0;
                    }
                }
            }
        }, 100);
        
        //Have to think this through again:
        //needs a listen/watch
        // refreshInterval = setInterval(async () => {
        //     await loadDeviceData()
        //     await loadDeviceSettings()
        // }, 30000);
    }
    
    // Load saved bedtime preference
    // const saved = localStorage.getItem('targetBedtime');
    // if (saved) targetBedtime.value = saved;
});

onUnmounted(() => {
    document.body.style.overflow = ''
    if (refreshInterval) clearInterval(refreshInterval);
    if (settingsCheckInterval) clearInterval(settingsCheckInterval);
});

//watch for errors 
watch(() => globalTargetDevice.value?.safety, (newSafety) => {
    if (newSafety !== undefined) {
        activateSafety.value = newSafety === 1;
    }
});

watch(() => isMotorError.value, (newError) => {
    motorError.value = newError;
});
// watch(globalTargetDevice, async (targetDeviceData) => {
//     if (targetDeviceData) {
//         await loadDeviceData();
//     }
// });

// watch(globalDeviceSettings, async (targetDeviceSettings) => {
//     if (targetDeviceSettings) {
//         await loadDeviceSettings();
//     }
// });



async function sendVibration() { 
    if(!isOn.value) return;
    sendCommand("vibration_".concat((valueVibration.value).toString()))
    console.log("vibration_".concat((valueVibration.value).toString()))
    if (globalDeviceSettings.value) {
        globalDeviceSettings.value.vibration = valueVibration.value;
    }
    //maybe i need this?:
    // globalTargetDevice.value.vibration = valueVibration.value
}

async function sendIntensity() { 
    if(!isOn.value) return;
    sendCommand("intensity_".concat((valueIntensity.value).toString()))
    if (globalDeviceSettings.value) {
        globalDeviceSettings.value.intensity = valueIntensity.value;
    }
    //maybe i need this?:
    // globalTargetDevice.value.intensity = valueIntensity.value
    console.log("intensity_".concat((valueIntensity.value).toString()))
}

function handleToggle(value){
    isOn.value = value
    console.log('Toggle value:', value);
    const newMotorStatus = value ? 2 : 1;
    if (globalDeviceSettings.value) {
        globalDeviceSettings.value.motor_status = newMotorStatus;
    }
    sendCommand("motor_status_".concat((newMotorStatus).toString()))
    console.log("motor_status_".concat((newMotorStatus).toString()))
    // if(value) { 
    //     globalDeviceSettings.value.motor_status = 2;
    //     sendCommand("motor_status_".concat((globalDeviceSettings.value.motor_status).toString()))
    //     console.log("motor_status_".concat((globalDeviceSettings.value.motor_status).toString()))
    // } else { 
    //     globalDeviceSettings.value.motor_status = 1;
    //     sendCommand("motor_status_".concat((globalDeviceSettings.value.motor_status).toString()))
    //     console.log("motor_status_".concat((globalDeviceSettings.value.motor_status).toString()))
    // }
}
</script>

<style scoped>
.online{
    background-color: var(--light-blue);
}

.custom-sider :deep(.slider-track){ 
    background: var(--ui-neutral);
}

.inactiveSlider :deep(.slider-track){ 
    background: var(--ui-warning);
}

.inactiveColor{
    background-color: #d1d5db;
}

.bedTurnedOnColor { 
    opacity: 1;
    /* background-color: var(--gradient-start); */
}

/* bed animation */
.bed-moving-part {
    transition: animation-duration 0.3s ease-out;
}

@keyframes bed-slide {
    0% { transform: translateX(var(--slide-distance-neg)); }
    50% { transform: translateX(var(--slide-distance)); }
    100% { transform: translateX(var(--slide-distance-neg)); }
}

.bed-moving-part {
    transition: animation-duration 0.3s ease-out;
}

.bed-animating {
    animation: bed-slide var(--animation-speed) ease-in-out infinite;
}

.bed-intensity-0 { --slide-distance: 0px; --slide-distance-neg: 0px; --animation-speed: 2s; }
.bed-intensity-1 { --slide-distance: 4px; --slide-distance-neg: -4px; --animation-speed: 4s; }
.bed-intensity-2 { --slide-distance: 8px; --slide-distance-neg: -8px; --animation-speed: 4s; }
.bed-intensity-3 { --slide-distance: 12px; --slide-distance-neg: -12px; --animation-speed: 4s; }
.bed-intensity-4 { --slide-distance: 16px; --slide-distance-neg: -16px; --animation-speed: 4s; }
.bed-intensity-5 { --slide-distance: 20px; --slide-distance-neg: -20px; --animation-speed: 4s; }
.bed-intensity-6 { --slide-distance: 24px; --slide-distance-neg: -24px; --animation-speed: 4s; }
.bed-intensity-7 { --slide-distance: 28px; --slide-distance-neg: -28px; --animation-speed: 4s; }
.bed-intensity-8 { --slide-distance: 32px; --slide-distance-neg: -32px; --animation-speed: 4s; }

</style>