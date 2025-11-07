<template>
    <div class="min-h-screen bg-slate-900 text-gray-100 p-4">
        <div class="max-w-6xl mx-auto">
            <div class="mb-8">
                <h1 class="text-4xl font-bold mb-2">Calmea Dashboard</h1>
                <p class="text-gray-400">Bed monitoring system</p>
            </div>

            <!-- Loading State -->
            <div v-if="loading && devices.length === 0" class="bg-slate-800 rounded-lg p-12 text-center">
                <div class="text-6xl mb-4">⏳</div>
                <h2 class="text-2xl font-bold mb-2">Loading...</h2>
                <p class="text-gray-400">Fetching devices from backend...</p>
            </div>

            <!-- Devices Grid -->
            <div v-else-if="devices.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="device in devices" :key="device.device_id" 
                     class="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition">
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

                    <div class="space-y-2 mb-4">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-400">Temperature:</span>
                            <span class="font-medium">{{ device.temperature || '–' }}°C</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-400">Motor:</span>
                            <span class="font-medium">{{ device.motor_status || '–' }}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-400">Storage:</span>
                            <span class="font-medium">{{ device.sd_free_storage || '–' }} GB</span>
                        </div>
                    </div>

                    <NuxtLink :to="`/bed-ops?device=${device.device_id}`" 
                              class="block w-full text-center bg-blue-600 hover:bg-blue-700 py-2 rounded transition">
                        Control Device →
                    </NuxtLink>

                    <div class="mt-3 text-xs text-gray-500">
                        Last seen: {{ formatTimeAgo(device.last_seen) }}
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-else class="bg-slate-800 rounded-lg p-12 text-center">
                <div class="text-6xl mb-4">🛏️</div>
                <h2 class="text-2xl font-bold mb-2">No Devices Connected</h2>
                <p class="text-gray-400 mb-4">
                    {{ error ? 'Could not connect to backend server' : 'Waiting for ESP32 devices to connect...' }}
                </p>
                <p v-if="error" class="text-red-400 text-sm mb-4">{{ error }}</p>
                <button @click="loadDevices" 
                        class="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded">
                    Refresh
                </button>
            </div>

            <!-- Debug Panel -->
            <div class="mt-8 bg-slate-800 rounded-lg p-4">
                <div class="flex justify-between items-center mb-3">
                    <h3 class="font-bold">Debug Info</h3>
                    <button @click="loadDebug" class="text-sm bg-slate-700 px-3 py-1 rounded hover:bg-slate-600">
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
                    <pre v-if="debugData" class="mt-2 p-2 bg-slate-900 rounded text-xs overflow-auto max-h-96">{{ JSON.stringify(debugData, null, 2) }}</pre>
                    <p v-else class="mt-2 text-gray-500">No debug data loaded</p>
                </details>
            </div>

            <div class="mt-4 text-center text-sm text-gray-500">
                Auto-refresh every 10 seconds • Last update: {{ lastUpdate }}
            </div>
        </div>
    </div>
</template>

<script setup>
const config = useRuntimeConfig();
const apiBase = config.public.apiBase;

const devices = ref([]);
const debugData = ref(null);
const lastUpdate = ref('Never');
const loading = ref(false);
const error = ref('');

let refreshInterval = null;

onMounted(async () => {
    await loadDevices();
    
    // Auto-refresh every 10 seconds
    refreshInterval = setInterval(async () => {
        await loadDevices();
    }, 10000);
});

onUnmounted(() => {
    if (refreshInterval) clearInterval(refreshInterval);
});

async function loadDevices() {
    loading.value = true;
    error.value = '';
    
    try {
        const res = await fetch(`${apiBase}/devices`);
        
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        devices.value = data.devices || [];
        lastUpdate.value = new Date().toLocaleTimeString();
    } catch (err) {
        console.error('Error loading devices:', err);
        error.value = err.message;
    } finally {
        loading.value = false;
    }
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

function formatTimeAgo(timestamp) {
    if (!timestamp) return 'Never';
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
}
</script>