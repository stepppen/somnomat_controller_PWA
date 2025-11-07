<template>
    <div class="main-container py-4">
        <div class="main-flex-container">
            <h2>Account</h2>
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