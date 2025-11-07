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
                        <div v-for="device in devices" :key="device.device_id">
                            <div class="flex justify-between items-start mb-4">
                                <div>
                                    <h2 class="text-xl font-bold">{{ device.custom_name || 'Unnamed Device' }}</h2>
                                    <p class="text-sm text-gray-400">{{ device.device_id }}</p>
                                </div>
                                <span :class="['px-2 py-1 rounded text-xs font-medium',
                                            device.status === 'online' ? 'bg-green-600' : 'bg-gray-600']">
                                    {{ device.status || 'unknown' }}
                                </span>
                            </div>

                            <div class="pt-3 text-xs text-gray-500">
                                Last seen: {{ formatTimeAgo(device.last_seen) }}
                            </div>
                        </div>
                    </div>
                </primitives-container>
        </div>
        <div class="main-container">
                    <!-- Control Panel -->
                     <primitives-container>
                         <h2 class="text-xl font-bold mb-4">Controls</h2>
                         <div class="grid grid-cols-3 gap-3">
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
                        <div class="pt-4">
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
                <div v-if="selectedDevice">
                    <!-- Device Status -->
                    <primitives-container>
                        <h2 class="text-xl font-bold mb-4">Device Status</h2>
                        <div class="grid grid-cols-2 gap-4">
                            <primitives-nestedContainer>
                                <div class="text-sm text-gray-400">Temperature</div>
                                <div class="text-2xl font-bold">{{ deviceData?.temperature || '–' }}°C</div>
                            </primitives-nestedContainer>
                            <primitives-nestedContainer>
                                <div class="text-sm text-gray-400">Motor Status</div>
                                <div class="text-2xl font-bold">{{ deviceData?.motor_status || '–' }}</div>
                            </primitives-nestedContainer>
                            <primitives-nestedContainer>
                                <div class="text-sm text-gray-400">SD Storage</div>
                                <div class="text-2xl font-bold">{{ deviceData?.sd_free_storage || '–' }} GB</div>
                            </primitives-nestedContainer>
                            <primitives-nestedContainer>
                                <div class="text-sm text-gray-400">Status</div>
                                <div class="text-2xl font-bold capitalize">{{ deviceData?.status || '–' }}</div>
                            </primitives-nestedContainer>
                        </div>
    
                        <!-- Device Info -->
                        <div class="mt-4 pt-4 border-slate-700 grid grid-cols-2 gap-2 text-sm">
                            <div><span class="text-gray-400">MAC:</span> {{ deviceData?.mac || '–' }}</div>
                            <div><span class="text-gray-400">Partition:</span> {{ deviceData?.partition || '–' }}</div>
                            <div><span class="text-gray-400">Version:</span> {{ deviceData?.version_factory || '–' }}</div>
                            <div><span class="text-gray-400">Last Seen:</span> {{ formatTime(deviceData?.last_seen) }}</div>
                        </div>
                    </primitives-container>
                </div>
                <div v-else class="bg-slate-800 rounded-lg p-12 text-center">
                        <div class="text-6xl mb-4">🎮</div>
                        <p class="text-gray-400">Select a device to start controlling it</p>
                    </div>
            </div>
                <!-- Debug Panel -->
            <div class="main-container">
                <primitives-container>
                    <div class="flex justify-between items-center mb-3">
                    <h3 class="font-bold">Debug Info</h3>
                    <button @click="loadDebug" class="text-sm bg-slate-200 px-3 py-1 rounded hover:bg-slate-600">
                        Refresh
                    </button>
                    </div>

                    <div class="text-xs text-gray-400 mb-2">
                    API Endpoint: {{ apiBase }}
                    </div>

                    <details class="text-sm">
                    <summary class="cursor-pointer text-gray-400 hover:text-gray-300">
                        Show Debug Data
                    </summary>
                    <pre v-if="debugData" class="mt-2 p-2 bg-slate-200 rounded text-xs overflow-auto max-h-96">{{ JSON.stringify(debugData, null, 2) }}</pre>
                    <p v-else class="mt-2 text-gray-500">No debug data loaded</p>
                    </details>
                </primitives-container>
            </div>
    </div>
</template>

<script setup>
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

let refreshInterval = null;

onMounted(async () => {
    await loadDevices();
    
    // Check if device is pre-selected from URL query parameter
    const deviceFromQuery = route.query.device;
    if (deviceFromQuery && devices.value.some(d => d.device_id === deviceFromQuery)) {
        selectedDevice.value = deviceFromQuery;
        await loadDevice();
    } else if (devices.value.length > 0) {
        selectedDevice.value = devices.value[0].device_id;
        await loadDevice();
    }
    
    // Refresh every 5 seconds - REFRESH BOTH devices list AND selected device
    refreshInterval = setInterval(async () => {
        await loadDevices(); // ← Add this line to refresh the devices list
        if (selectedDevice.value) {
            await loadDevice();
        } else if (devices.value.length > 0) {
            // Auto-select first device if none selected
            selectedDevice.value = devices.value[0].device_id;
            await loadDevice();
        }
    }, 5000);
});

onUnmounted(() => {
    if (refreshInterval) clearInterval(refreshInterval);
});

async function loadDevices() {
    try {
        const res = await fetch(`${apiBase}/devices`);
        
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        devices.value = data.devices || [];
    } catch (error) {
        console.error('Error loading devices:', error);
        showCommandStatus('Failed to load devices', 'error');
    }
}

async function loadDevice() {
    if (!selectedDevice.value) return;
    
    try {
        const res = await fetch(`${apiBase}/devices/${selectedDevice.value}`);
        
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        deviceData.value = await res.json();
    } catch (error) {
        console.error('Error loading device:', error);
    }
}

async function sendCommand(command, payload = {}) {
    try {
        const res = await fetch(`${apiBase}/commands`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                device_id: selectedDevice.value,
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

function formatTime(timestamp) {
    if (!timestamp) return '–';
    return new Date(timestamp).toLocaleTimeString();
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