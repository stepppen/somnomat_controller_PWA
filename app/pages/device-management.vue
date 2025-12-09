<template>
    <div class="main-container py-4 flex justify-start w-full">
        <div class="nav-button" @click="goBack">
            <Icon name="material-symbols:arrow-back-ios-rounded" size="1.5em"/>
        </div>
    </div>
    
    <div class="main-container">
        <primitives-container>
            <h3>Change Device ID</h3>
            
            <UInput 
                v-model="inputValue" 
                autocomplete="off" 
                placeholder="Enter device ID"
                :disabled="loading"
            />
            
            <UButton 
                type="submit" 
                @click="setDeviceId"
                :loading="loading"
                :disabled="!inputValue || loading"
            >
                {{ loading ? 'Searching...' : 'Save' }}
            </UButton>
            
            <div v-if="error" class="text-red-500 text-sm mt-2">
                {{ error }}
            </div>
            
            <div v-if="successMessage" class="text-green-500 text-sm mt-2">
                {{ successMessage }}
            </div>
            
            <div v-if="globalDeviceId && globalDeviceName" class="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg"> 
                <h3 class="font-bold mb-2">Current Device:</h3>
                <p><span class="text-gray-400">Device ID:</span> {{ globalDeviceId }}</p>
                <p><span class="text-gray-400">Device Name:</span> {{ globalDeviceName }}</p>
            </div>
            
            <div v-else class="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <h3 class="text-gray-400">No device configured</h3>
                <p class="text-sm text-gray-500 mt-1">Enter a device ID to get started</p>
            </div>
        </primitives-container>
    </div>
    
    <div v-if="deviceInfo" class="main-container mt-4">
        <primitives-container>
            <h3 class="mb-2">Device Information</h3>
            <div class="grid grid-cols-2 gap-2 text-sm">
                <div><span class="text-gray-400">MAC:</span> {{ deviceInfo.mac || 'N/A' }}</div>
                <div><span class="text-gray-400">Partition:</span> {{ deviceInfo.partition || 'N/A' }}</div>
                <div><span class="text-gray-400">Version:</span> {{ deviceInfo.version || 'N/A' }}</div>
                <div><span class="text-gray-400">Last Seen:</span> {{ deviceInfo.last_seen || 'N/A' }}</div>
                <div><span class="text-gray-400">Status:</span> {{ deviceInfo.status || 'N/A' }}</div>
            </div>
        </primitives-container>
    </div>
</template>

<script setup>
const router = useRouter()
const route = useRoute()
const goBack = () => {
    router.back()
}
const inputValue = ref('')
const config = useRuntimeConfig();
const apiBase = config.public.apiBase;

const loading = ref(false);
const error = ref('');
const successMessage = ref('');
const deviceInfo = ref(null);

// Access the global state
const globalDeviceId = useState('globalDeviceId', () => "")
const globalDeviceName = useState('globalDeviceName', () => "")

// Load current device info on mount
onMounted(async () => {
    if (globalDeviceId.value) {
        inputValue.value = globalDeviceId.value;
        await loadDeviceInfo(globalDeviceId.value);
    }
});

async function loadDeviceInfo(deviceId) {
    try {
        const devicesRes = await fetch(`${apiBase}/devices/${deviceId}`);
        if (!devicesRes.ok) return;
        
        const data = await devicesRes.json();
        if (data.data && data.data.length > 0) {
            deviceInfo.value = data.data[0];
        }
    } catch (err) {
        console.error('Error loading device info:', err);
    }
}

async function setDeviceId() { 
    loading.value = true;
    error.value = '';
    successMessage.value = '';
    deviceInfo.value = null;
    
    try {
        const testRes = await fetch(`${apiBase}/debug`);
        if (!testRes.ok) {
            error.value = 'Backend not responding. Make sure main.py is running on port 10000.';
            loading.value = false;
            return;
        }
        
        const devicesRes = await fetch(`${apiBase}/devices/${inputValue.value}`);
        
        if (!devicesRes.ok) {
            if (devicesRes.status === 404) {
                error.value = `Device with ID "${inputValue.value}" not found`;
            } else {
                error.value = `Error: HTTP ${devicesRes.status}`;
            }
            loading.value = false;
            return;
        }
        
        const totalDevices = await devicesRes.json();
        
        if (totalDevices.data && totalDevices.data.length > 0) {
            const device = totalDevices.data[0];
            
            globalDeviceId.value = device.id;
            globalDeviceName.value = device.name;
            deviceInfo.value = device;
            
            successMessage.value = `Device "${device.name}" configured successfully!`;
            
            console.log("Device ID set:", globalDeviceId.value);
            console.log("Device Name set:", globalDeviceName.value);
        } else {
            error.value = "No device found with that ID";
        }

    } catch (err) {
        console.error('Error loading data:', err);
        error.value = `Failed to load device: ${err.message}`;
    } finally {
        loading.value = false;
    }
}
</script>