<template>
    <div class="min-h-screen bg-slate-900 text-gray-100 p-4">
        <div class="max-w-4xl mx-auto">
            <div class="flex items-center gap-4 mb-6">
                <NuxtLink to="/" class="text-blue-400 hover:text-blue-300">← Back</NuxtLink>
                <h1 class="text-3xl font-bold">Bed Control</h1>
            </div>

            <!-- Device Selector -->
            <div class="bg-slate-800 rounded-lg p-4 mb-6">
                <label class="block text-sm mb-2">Select Device</label>
                <select v-model="selectedDevice" @change="loadDevice" 
                        class="w-full bg-slate-700 rounded px-4 py-2 text-gray-100">
                    <option value="">Choose device...</option>
                    <option v-for="device in devices" :key="device.device_id" :value="device.device_id">
                        {{ device.custom_name || device.device_id }}
                    </option>
                </select>
            </div>

            <div v-if="selectedDevice">
                <!-- Control Panel -->
                <div class="bg-slate-800 rounded-lg p-6 mb-6">
                    <h2 class="text-xl font-bold mb-4">Controls</h2>
                    <div class="grid grid-cols-3 gap-3">
                        <button @click="sendCommand('power_on')" 
                                class="bg-green-600 hover:bg-green-700 py-3 rounded font-medium transition">
                            Power ON
                        </button>
                        <button @click="sendCommand('power_off')" 
                                class="bg-red-600 hover:bg-red-700 py-3 rounded font-medium transition">
                            Power OFF
                        </button>
                        <button @click="sendCommand('meditation')" 
                                class="bg-purple-600 hover:bg-purple-700 py-3 rounded font-medium transition">
                            Meditation
                        </button>
                    </div>
                    
                    <!-- Motor Speed -->
                    <div class="mt-6">
                        <label class="block text-sm mb-2">Motor Speed: {{ motorSpeed }}%</label>
                        <input v-model.number="motorSpeed" type="range" min="0" max="100" 
                               @change="sendCommand('motor_speed', {speed: motorSpeed})"
                               class="w-full accent-blue-600">
                    </div>

                    <!-- Last Command Echo -->
                    <div v-if="lastEcho" class="mt-4 p-3 bg-slate-700 rounded">
                        <div class="text-sm text-gray-400">Last Command Echo:</div>
                        <pre class="text-xs text-green-400 mt-1">{{ JSON.stringify(lastEcho, null, 2) }}</pre>
                    </div>

                    <!-- Command Status -->
                    <div v-if="commandStatus" class="mt-4 p-3 rounded"
                         :class="commandStatus.type === 'error' ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'">
                        <div class="text-sm">{{ commandStatus.message }}</div>
                    </div>
                </div>

                <!-- Device Status -->
                <div class="bg-slate-800 rounded-lg p-6">
                    <h2 class="text-xl font-bold mb-4">Device Status</h2>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-slate-700 rounded p-4">
                            <div class="text-sm text-gray-400">Temperature</div>
                            <div class="text-2xl font-bold">{{ deviceData?.temperature || '–' }}°C</div>
                        </div>
                        <div class="bg-slate-700 rounded p-4">
                            <div class="text-sm text-gray-400">Motor Status</div>
                            <div class="text-2xl font-bold">{{ deviceData?.motor_status || '–' }}</div>
                        </div>
                        <div class="bg-slate-700 rounded p-4">
                            <div class="text-sm text-gray-400">SD Storage</div>
                            <div class="text-2xl font-bold">{{ deviceData?.sd_free_storage || '–' }} GB</div>
                        </div>
                        <div class="bg-slate-700 rounded p-4">
                            <div class="text-sm text-gray-400">Status</div>
                            <div class="text-2xl font-bold capitalize">{{ deviceData?.status || '–' }}</div>
                        </div>
                    </div>

                    <!-- Device Info -->
                    <div class="mt-4 pt-4 border-t border-slate-700 grid grid-cols-2 gap-2 text-sm">
                        <div><span class="text-gray-400">MAC:</span> {{ deviceData?.mac || '–' }}</div>
                        <div><span class="text-gray-400">Partition:</span> {{ deviceData?.partition || '–' }}</div>
                        <div><span class="text-gray-400">Version:</span> {{ deviceData?.version_factory || '–' }}</div>
                        <div><span class="text-gray-400">Last Seen:</span> {{ formatTime(deviceData?.last_seen) }}</div>
                    </div>
                </div>
            </div>

            <div v-else class="bg-slate-800 rounded-lg p-12 text-center">
                <div class="text-6xl mb-4">🎮</div>
                <p class="text-gray-400">Select a device to start controlling it</p>
            </div>
        </div>
    </div>
</template>

<script setup>
const config = useRuntimeConfig();
const apiBase = config.public.apiBase;
const route = useRoute();

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
    
    // Refresh every 5 seconds
    refreshInterval = setInterval(() => {
        if (selectedDevice.value) loadDevice();
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
</script>