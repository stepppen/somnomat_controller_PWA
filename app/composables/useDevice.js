export const useDevice = () => {
    let globalDeviceId = useState('globalDeviceId', () => "")
    let globalDeviceName = useState('globalDeviceName', () => "")
    let globalTargetDevice = useState('globalTargetDevice', () => null)
    let globalSleepSummary = useState('globalSleepSummary', () => null)
    let globalLoading = useState('globalLoading', () => false)
    let globalError = useState('globalError', () => '')
    let globalCommandStatus = useState('globalError', () => null)
    const isOn = useState('isOnChecked', () => false)

    const config = useRuntimeConfig()
    const apiBase = config.public.apiBase


    //API Functions
    const loadDeviceData = async () => {
        if (!globalDeviceId.value) {
            console.log("No device ID set");
            return;
        }
        globalLoading.value = true;
        globalError.value = '';
        
        try {
            const testRes = await fetch(`${apiBase}/debug`);
            if (!testRes.ok) {
                globalError.value = 'Backend not responding. Make sure main.py is running on port 10000.';
                globalLoading.value = false;
                return;
            }
            
            //fetch device with global state id
            const deviceRes = await fetch(`${apiBase}/devices/${globalDeviceId.value}`);
            if (!deviceRes.ok) throw new Error(`HTTP ${deviceRes.status}`);
            
            const deviceData = await deviceRes.json();
            
            if (deviceData.data && deviceData.data.length > 0) {
                globalTargetDevice.value = deviceData.data[0];
                console.log("Loaded device:", globalTargetDevice.value.name)
            } else {
                globalError.value = "Device not found";
                return;
            }

        } catch (err) {
            console.error('Error loading data:', err);
            globalError.value = err.message;
        } finally {
            globalLoading.value = false;
        }
    }

    const loadSleepSummary = async () => {
        if (!globalDeviceId.value) {
            console.log("No device ID set");
            return;
        }
        globalLoading.value = true;
        globalError.value = '';
        
        try {
            const testRes = await fetch(`${apiBase}/debug`);
            if (!testRes.ok) {
                globalError.value = 'Backend not responding. Make sure main.py is running on port 10000.';
                globalLoading.value = false;
                return;
            }


            const sleepRes = await fetch(`${apiBase}/sleep/${globalDeviceId.value}/summary`);
            // const sleepdata = await sleepRes.json();
            // console.log(sleepdata)
            if (!sleepRes.ok) {
                const errorText = await sleepRes.text();
                throw new Error(`HTTP ${sleepRes.status}: ${errorText}`);
            }
            
            const sleepdata = await sleepRes.json();
            console.log(sleepdata);
            globalSleepSummary.value = sleepdata;
            console.log(globalSleepSummary.value.summary.intervals)
            //optional but never used previously in the component
            // lastUpdate.value = new Date().toLocaleTimeString();
        } catch (err) {
            console.error('Error loading data:', err);
            globalError.value = err.message;
        } finally {
            globalLoading.value = false;
        }
    }

    const sendCommand = async (command, payload = {}) => {
        if (!globalDeviceId.value) {
            console.error("No device ID set");
            showCommandStatus("No device selected", "error");
            return;
        }
        try {
            console.log("Sending command to device_id:", globalDeviceId.value)
            const res = await fetch(`${apiBase}/commands`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    device_id:  (globalDeviceId.value).toString(),
                    command: command.toString(),
                    payload: payload
                })
            });
            
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            
            const data = await res.json();
            //optional but never used previously in the component (as in loadSummary)
            // lastEcho.value = data.echo;
            showCommandStatus(`Command '${command}' sent successfully`, 'success');
            console.log('Command sent:', data);
        } catch (error) {
            console.error('Error sending command:', error);
            showCommandStatus(`Failed to send command: ${error.message}`, 'error');
        }
    }

    function showCommandStatus(message, type) {
        globalCommandStatus.value = { message, type };
        setTimeout(() => {
            globalCommandStatus.value = null;
        }, 5000);
    }

    // Helper functions
    function formatDate(isoDate) {
        const d = new Date(isoDate);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    function formatTime(isoTimestamp) {
        const d = new Date(isoTimestamp);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    return {
        // State
        globalDeviceId,
        globalDeviceName,
        globalTargetDevice, 
        globalSleepSummary,
        globalLoading,
        globalError,
        globalCommandStatus,
        isOn,
        
        // Functions
        loadDeviceData,
        loadSleepSummary,
        sendCommand,
        showCommandStatus,
        
        // Helpers
        formatDate,
        formatTime
    }

}