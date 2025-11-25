<template>
    <div class="main-container py-4 flex justify-between w-full">
        <div>
            <h2 class="text-left">Settings</h2>
        </div>
        <div class="flex gap-4">
            <!-- <div class="nav-button"
            @click="navigateTo('/')"
            :class="{active: currentPath === 'home'}">
                <Icon name="material-symbols:settings-outline-rounded" size="1.5em"/>
            </div> -->
            <div class="nav-button"
            @click="navigateTo('/')"
            :class="{active: currentPath === 'home'}">
                <Icon name="material-symbols:notifications-outline-rounded" size="1.5em"/>
            </div>
        </div>
        
    </div>
    <div class="flex flex-col gap-4">
        <div class="main-container">
            <!-- Device Selector -->
            <primitives-container>
                <label class="block text-sm mb-2">Your Account</label>
                <div class="flex gap-4 justify-between">
                    <div class="w-full">
                        <ul>
                            <li>
                                Name: Person 01
                            </li>
                        </ul>
                        <ul>
                            <li>
                                Name: Person 01
                            </li>
                        </ul>
                        <ul>
                            <li>
                                Name: Person 01
                            </li>
                        </ul>
                    </div>
                    <div>
                        <img src="/acc_default.png" alt="acc default" width="100px">
                    </div>
                </div>
            </primitives-container>
        </div>
        <div class="main-container">
            <!-- Device Selector -->
            <primitives-container>
                <label class="block text-sm mb-2">Your Device</label>
                <!-- Device Info -->
                <div class="mt-4 pt-4 border-slate-700 grid grid-cols-2 gap-2 text-sm">
                    <div><span class="text-gray-400">MAC:</span> <p>{{ deviceData?.mac || '–' }}</p></div>
                    <div><span class="text-gray-400">Partition:</span> <p>{{ deviceData?.partition || '–' }}</p></div>
                    <div><span class="text-gray-400">Version:</span> <p>{{ deviceData?.version_factory || '–' }}</p></div>
                    <div><span class="text-gray-400">Last Seen:</span> <p>{{ formatTime(deviceData?.last_seen) }}</p></div>
                </div>
            </primitives-container>
        </div>
        <div class="main-container">
            <!-- Device Selector -->
            <primitives-container>
                <label class="block text-sm mb-2">Over the Air Update</label>
                    <button @click="sendCommand('OTA')" 
                    class="bg-slate-200 active:bg-slate-300 py-3 rounded font-medium transition">
                        Update Device
                    </button>
            </primitives-container>
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

function formatTime(timestamp) {
    if (!timestamp) return '–';
    return new Date(timestamp).toLocaleTimeString();
}
</script>