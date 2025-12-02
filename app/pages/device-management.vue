<template>
    <div class="main-container py-4 flex justify-start w-full">
        <div class="nav-button"
            @click="navigateTo('/settings')">
                <Icon name="material-symbols:arrow-back-ios-rounded" size="1.5em"/>
            </div>
    </div>
    <div class="main-container">
        <!-- Preferences Section -->
        <primitives-container>
            <h3>Change Device ID</h3>
            <UInput v-model="inputValue" />
            <UButton type="submit" @click="setDeviceId">
                Save
            </UButton>
        </primitives-container>
    </div>
    <div class="mt-4 pt-4 border-slate-700 grid grid-cols-2 gap-2 text-sm">
        <div><span class="text-gray-400">MAC:</span> <p>2</p></div>
        <div><span class="text-gray-400">Partition:</span> <p>2</p></div>
        <div><span class="text-gray-400">Version:</span> <p>2</p></div>
        <div><span class="text-gray-400">Last Seen:</span> <p>2</p></div>
    </div>
</template>

<script setup lang="ts">
const inputValue = ref('')
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
// const isOn = useState('isOnChecked', () => false)


async function setDeviceId() { 
    loading.value = true;
    error.value = '';
    
    try {
        const testRes = await fetch(`${apiBase}/debug`);
        if (!testRes.ok) {
            error.value = 'Backend not responding. Make sure main.py is running on port 10000.';
            loading.value = false;
            return;
        }
        
        const devicesRes = await fetch(`${apiBase}/devices/${inputValue.value}`);
        if (!devicesRes.ok) throw new Error(`HTTP ${devicesRes.status}`);
        
        totalDevices.value = await devicesRes.json();
        console.log("Device: ", totalDevices.value)
        // targetDevice.value = totalDevices.value.data.find(d => d.id === 987);
        // deviceId.value = (targetDevice?.id).toString() || null;
        // console.log("device:", targetDevice.value.name)
        // totalDevices.value = devicesRes
        // console.log(`${apiBase}/sleep/${deviceId.value}/summary`)

    } catch (err) {
        console.error('Error loading data:', err);
        error.value = err.message;
    } finally {
        loading.value = false;
    }
}


</script>