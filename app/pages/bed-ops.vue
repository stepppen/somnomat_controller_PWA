<template>
    <div class="main-container py-4">
        <div class="main-flex-container">
            <h2>Bed Operation</h2>
        </div>
    </div>
    <div class="flex flex-col gap-4">
        <div class="main-container">
                <primitives-container>
                    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <div class="flex justify-between items-start mb-4">
                                <div v-if="targetDevice">
                                    <h2 class="text-xl font-bold">{{ targetDevice.custom_name || 'Unnamed Device' }}</h2>
                                    <p class="text-sm text-gray-400">{{ targetDevice.device_id }}</p>
                                </div>
                                <span v-if="targetDevice" :class="['px-2 py-1 rounded text-xs font-medium',
                                            targetDevice.status === 'online' ? 'bg-green-600' : 'bg-gray-600']">
                                    {{ targetDevice.status || 'unknown' }}
                                </span>
                            </div>

                            <div v-if="targetDevice" class="pt-3 text-xs text-gray-500" >
                                Last seen: {{ formatTimeAgo(targetDevice.last_seen) }}
                            </div>
                        </div>
                    </div>
                </primitives-container>
        </div>
        <div class="main-container" >
                    <!-- Control Panel -->
                     <primitives-container>
                         <h2 class="text-xl font-bold mb-4">Controls</h2>
                         <div class="grid grid-cols-3 gap-3">
                              <button class="bg-slate-200 active:bg-slate-300 py-3 rounded font-medium transition" @click="playBack">
                                Play Sound 
                            </button>
                             <button @click="sendCommand('on')" 
                                     class="bg-slate-200 active:bg-slate-300 py-3 rounded font-medium transition">
                                 Power ON
                             </button>
                             <button @click="sendCommand('off')" 
                                     class="bg-slate-200 active:bg-slate-300 py-3 rounded font-medium transition">
                                 Power OFF
                             </button>
                             <button @click="sendCommand('meditation')" 
                                     class="bg-slate-200 active:bg-slate-300 py-3 rounded font-medium transition">
                                 Meditation
                             </button>
                         </div>
                        <!-- Motor Speed -->
                        <div class="pt-4" >
                            <label class="block text-sm mb-2">Motor Speed: {{ motorSpeed }}%</label>
                            <input v-model.number="motorSpeed" type="range" min="0" max="100" 
                                   @change="sendCommand('motor_speed', {speed: motorSpeed})"
                                   class="w-full accent-blue-600">
                        </div>
                     </primitives-container>

                    <primitives-container v-if="lastEcho">
                        <!-- Last Command Echo -->
                        <div  class="mt-4 p-3 bg-slate-700 rounded">
                            <div class="text-sm text-gray-400">Last Command Echo:</div>
                            <pre class="text-xs text-green-400 mt-1">{{ JSON.stringify(lastEcho, null, 2) }}</pre>
                        </div>
    
                        <!-- Command Status -->
                        <div v-if="commandStatus" class="mt-4 p-3 rounded"
                             :class="commandStatus.type === 'error' ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'">
                            <div class="text-sm">{{ commandStatus.message }}</div>
                        </div>

                    </primitives-container>
            </div>
            <div class="main-container">
                <div v-if="targetDevice">
                    <!-- Device Status -->
                    <primitives-container>
                        <h2 class="text-xl font-bold mb-4">Device Status</h2>
                        <div class="grid grid-cols-2 gap-4">
                            <primitives-nestedContainer>
                                <div class="text-sm text-gray-400">Temperature</div>
                                <div class="text-2xl font-bold">{{ targetDevice?.temperature || '–' }}°C</div>
                            </primitives-nestedContainer>
                            <primitives-nestedContainer>
                                <div class="text-sm text-gray-400">Motor Status</div>
                                <div class="text-2xl font-bold">{{ targetDevice?.motor_status || '–' }}</div>
                            </primitives-nestedContainer>
                            <primitives-nestedContainer>
                                <div class="text-sm text-gray-400">SD Storage</div>
                                <div class="text-2xl font-bold">{{ targetDevice?.sd_free_storage || '–' }} GB</div>
                            </primitives-nestedContainer>
                            <primitives-nestedContainer>
                                <div class="text-sm text-gray-400">Status</div>
                                <div class="text-2xl font-bold capitalize">{{ targetDevice?.status || '–' }}</div>
                            </primitives-nestedContainer>
                        </div>
                    </primitives-container>
                </div>
                <div v-else class="bg-slate-800 rounded-lg p-12 text-center">
                        <p class="text-gray-400">No device selected</p>
                    </div>
            </div>
            
    </div>
</template>

<script setup>
const playBack = () => {
  const audio = new Audio('/audio/example.wav')
  audio.volume = 0.25
  audio.play()
}
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
const targetDevice = ref(null);
const lastUpdate = ref('Never');
const totalDevices = ref(null);
const deviceId = ref('');
let refreshInterval = null;
const loading = ref(false);
const error = ref('');

// Lifecycle
onMounted(async () => {
    await loadData();
    
    refreshInterval = setInterval(async () => {
        await loadData();
    }, 30000);
    
    // Load saved bedtime preference
    // const saved = localStorage.getItem('targetBedtime');
    // if (saved) targetBedtime.value = saved;
});

onUnmounted(() => {
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
        targetDevice.value = totalDevices.value.data.find(d => d.device_id === 'esp32-bed-002');
        deviceId.value = targetDevice?.device_id || null;
        console.log("device:", targetDevice.value.custom_name)


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
        const res = await fetch(`${apiBase}/commands`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                device_id: deviceId.value,
                command: command,
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
</script>