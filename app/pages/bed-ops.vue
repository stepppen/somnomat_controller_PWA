<template>
    <div class="max-h-[90vh]">
        <div class="main-container py-4 flex justify-between w-full">
            <div>
                <h2 class="text-left">Bed Operation</h2>
            </div>
            <div class="flex gap-4">
                <div class="nav-button"
                @click="navigateTo('/')"
                :class="{active: currentPath === 'home'}">
                    <Icon name="material-symbols:settings-outline-rounded" size="1.5em"/>
                </div>
                <div class="nav-button"
                @click="navigateTo('/notifications')"
                :class="{active: currentPath === 'home'}">
                    <Icon name="material-symbols:notifications-outline-rounded" size="1.5em"/>
                </div>
            </div>
            
        </div>
        <div class="flex flex-col gap-4">
            <div class="main-container w-full flex justify-center pt-16">
                <div class="flex flex-col gap-2 align-items-center justify-center">
                    <div v-if="targetDevice">
                        <h3 class="text-xl font-bold">{{ targetDevice.name || 'Unnamed Device' }}</h3>
                    </div>
                    <div class="flex justify-center gap-2">
                        <span v-if="targetDevice" :class="['px-2 py-1 rounded-full text-(--gradient-start) text-xs font-medium',
                                    targetDevice.status === 'online' ? 'online' : 'bg-gray-300']">
                            <p class="p-small">
                                {{ targetDevice.status || 'offline' }}
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
    </div>
</template>

<script setup>
const valueIntensity = ref(0)
const valueVibration = ref(0)
const config = useRuntimeConfig();
const apiBase = config.public.apiBase;

const route = useRoute();
const debugData = ref(null);

const devices = ref([]);
const selectedDevice = ref('');
const deviceData = ref(null);
const lastEcho = ref(null);
const motorSpeed = ref(50);
const commandStatus = ref(null);
const sleepSummary = ref(null);
const targetDevice = ref("not null");
const lastUpdate = ref('Never');
const totalDevices = ref(null);
const deviceId = ref('');
let refreshInterval = null;
const loading = ref(false);
const error = ref('');

// const isOn = ref(false);
const isOn = useState('isOnChecked', () => false)

// Lifecycle
onMounted(async () => {
    document.body.style.overflow = 'hidden'
    await loadData();
    
    refreshInterval = setInterval(async () => {
        await loadData();
    }, 30000);
    
    // Load saved bedtime preference
    // const saved = localStorage.getItem('targetBedtime');
    // if (saved) targetBedtime.value = saved;
});

onUnmounted(() => {
    document.body.style.overflow = ''
    if (refreshInterval) clearInterval(refreshInterval);
});

// Methods
async function loadData() {
    loading.value = true;
    error.value = '';
    
    try {
        const testRes = await fetch(`${apiBase}/debug`);
        if (!testRes.ok) {
            error.value = 'Backend not responding. Make sure main.py is running on port 10000.';
            loading.value = false;
            return;
        }
        
        const devicesRes = await fetch(`${apiBase}/devices`);
        if (!devicesRes.ok) throw new Error(`HTTP ${devicesRes.status}`);
        
        totalDevices.value = await devicesRes.json();
        targetDevice.value = totalDevices.value.data.find(d => d.id === 987);
        deviceId.value = (targetDevice?.id).toString() || null;
        console.log("device:", targetDevice.value.name)


        totalDevices.value = devicesRes
        // console.log(`${apiBase}/sleep/${deviceId.value}/summary`)


        const sleepRes = await fetch(`${apiBase}/sleep/${deviceId.value}/summary`);
        // const sleepdata = await sleepRes.json();
        // console.log(sleepdata)
        if (!sleepRes.ok) {
            const errorText = await sleepRes.text();
            throw new Error(`HTTP ${sleepRes.status}: ${errorText}`);
        }
        
        const sleepdata = await sleepRes.json();
        console.log(sleepdata);
        sleepSummary.value = sleepdata;
        console.log(sleepSummary.value.summary.intervals)
        lastUpdate.value = new Date().toLocaleTimeString();
    } catch (err) {
        console.error('Error loading data:', err);
        error.value = err.message;
    } finally {
        loading.value = false;
    }
}


async function sendCommand(command, payload = {}) {
    try {
        console.log("device_id: ", targetDevice.value)
        const res = await fetch(`${apiBase}/commands`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                device_id: targetDevice.value.id.toString(),
                command: command.toString(),
                payload: payload
            })
        });
        
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        lastEcho.value = data.echo;
        showCommandStatus(`Command '${command}' sent successfully`, 'success');
        console.log('Command sent:', data);
    } catch (error) {
        console.error('Error sending command:', error);
        showCommandStatus(`Failed to send command: ${error.message}`, 'error');
    }
}

function sendVibration() { 
    console.log("send vibration of: ", valueVibration.value)
    sendCommand("vibration_", valueVibration.value)
}

function sendIntensity() { 
    console.log("send intensity of: ", (valueIntensity.value).toString())
    sendCommand("intensity_", (valueIntensity.value).toString())
}

function showCommandStatus(message, type) {
    commandStatus.value = { message, type };
    setTimeout(() => {
        commandStatus.value = null;
    }, 5000);
}


function formatTimeAgo(timestamp) {
    if (!timestamp) return 'Never';
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
}

async function loadDebug() {
    try {
        const res = await fetch(`${apiBase}/debug`);
        
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        debugData.value = await res.json();
    } catch (err) {
        console.error('Error loading debug data:', err);
        debugData.value = { error: err.message };
    }
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