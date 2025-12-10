export const useDevice = () => {
    //default ID is set to 987 (bed esp); not best practise but 
    //removes the need to constantly enter ID by hand
    let globalDeviceId = useState('globalDeviceId', () => "987")
    let globalDeviceName = useState('globalDeviceName', () => "")
    let globalTargetDevice = useState('globalTargetDevice', () => null)
    let globalSleepSummary = useState('globalSleepSummary', () => null)
    let globalDeviceSettings = useState('globalDeviceSettings', () => null)
    let globalLoading = useState('globalLoading', () => false)
    let globalError = useState('globalError', () => '')
    let globalCommandStatus = useState('globalCommandStatus', () => null)
    let globalPeriod = useState('globalPeriod', () => "day")
    let globalDate = useState('globalDate', () => null)
    const isOn = useState('isOnChecked', () => false)
    const isOnline = useState('isDeviceOnline', () => false)
    const isOccupied = useState('isBedOccupied', () => false)
    let isSafety = useState('isSafetyOn', () => false)
    let isMotorError = useState('isMotorError', () => false)
    
    
    const pendingCommands = useState('pendingCommands', () => ({}))
    const lastCommandTime = useState('lastCommandTime', () => 0)

    const COMMAND_TIMEOUT = 15000 
    const POLLING_COOLDOWN = 3000
    const ONLINE_TIMEOUT_MILLIS = 120000

    const config = useRuntimeConfig()
    const apiBase = config.public.apiBase

    const setPendingCommand = (commandType, expectedValue) => {
        pendingCommands.value = {
            ...pendingCommands.value,
            [commandType]: {
                expected: expectedValue,
                sentAt: Date.now()
            }
        }
        lastCommandTime.value = Date.now()
        
        setTimeout(() => {
            clearPendingCommand(commandType)
        }, COMMAND_TIMEOUT)
    }

    const clearPendingCommand = (commandType) => {
        const newPending = { ...pendingCommands.value }
        delete newPending[commandType]
        pendingCommands.value = newPending
    }

    const shouldBlockUpdate = (commandType, incomingValue) => {
        const pending = pendingCommands.value[commandType]
        
        if (!pending) return false
        
        const timeSinceCommand = Date.now() - pending.sentAt
        
        if (timeSinceCommand > COMMAND_TIMEOUT) {
            clearPendingCommand(commandType)
            return false
        }
        
        if (incomingValue === pending.expected) {
            clearPendingCommand(commandType)
            return false
        }
        
        if (timeSinceCommand < POLLING_COOLDOWN) {
            return true
        }
        
        return true
    }


    //API Functions
    const loadDeviceData = async (force = false) => {
        if (!globalDeviceId.value) {
            console.log("No device ID set");
            return;
        }
        
        if (!force && Date.now() - lastCommandTime.value < 1000) {
            console.log("Skipping reload: recent command sent");
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

                //Need to finish this isOnline flag
                // if (deviceData.data[0].last_seen > LAST_SEEN_VAL) { 
                //     isOnline.value = false 
                // }
                // else { isOnline.value = true }
                console.log("Device with safety:", globalTargetDevice.value.safety)
                if(deviceData.data[0].safety === 1) { 
                    isSafety.value = true;
                } else{
                    isSafety.value = false;
                }
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

    const loadDeviceSettings = async (force = false) => {
        if (!globalDeviceId.value) {
            console.log("No device ID set");
            return;
        }
        // if (!force && Date.now() - lastCommandTime.value < 1000) {
        //     console.log("Skipping settings reload - recent command sent");
        //     return;
        // }

        globalLoading.value = true;
        globalError.value = '';

        
        
        try {
            const testRes = await fetch(`${apiBase}/debug`);
            if (!testRes.ok) {
                globalError.value = 'Backend not responding. Make sure main.py is running on port 10000.';
                globalLoading.value = false;
                return;
            }
            
            //fetch device settings with global state id
            const deviceRes = await fetch(`${apiBase}/devices/${globalDeviceId.value}/settings`);
            if (!deviceRes.ok) throw new Error(`HTTP ${deviceRes.status}`);
            
            const deviceSettings = await deviceRes.json();
            console.log("device settings response: ", deviceSettings)
            
            if (deviceSettings.data && deviceSettings.data.length > 0) {
                const newSettings = deviceSettings.data[0];
                
                //only update if no pending commands
                if (!shouldBlockUpdate('motor_status', newSettings.motor_status)) {
                    if(newSettings.motor_status === 1) {
                        isMotorError.value = false; 
                        isOn.value = false;
                    } else if (newSettings.motor_status === 2) { 
                        isMotorError.value = false;
                        isOn.value = true;   
                    } else if (newSettings.motor_status === 0) { 
                        isMotorError.value = true;
                    }
                }else {
                    console.log("Blocking motor_status update - pending command")
                }
            globalDeviceSettings.value = newSettings;
            console.log("Device settings:", globalDeviceSettings.value)
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
        return globalDeviceSettings.value
    }

    //FINISH THIS FOR ONLINE 
    const loadLastOccupied = async () => { 
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
            
            //fetch device settings with global state id
            const occupiedRes = await fetch(`${apiBase}/devices/${globalDeviceId.value}/last_occupied`);
            if (!occupiedRes.ok) throw new Error(`HTTP ${occupiedRes.status}`);
            
            const lastOccupied = await occupiedRes.json();
            console.log("last occupied response: ", lastOccupied.data[0])
            
            // const lastSeenUTC = new Date(lastOccupied.data[0].created_at);
            // const lastSeenCET = lastSeenUTC.toLocaleString('en-GB', { 
            //     timeZone: 'Europe/Zurich'
            // })

            // console.log("CET time:", lastSeenCET);
            
            if (lastOccupied.data && lastOccupied.data.length > 0) {
                const lastSeenDate = new Date(lastOccupied.data[0].created_at);
                const lastOccupiedBool = lastOccupied.data[0].occupied;
                console.log("Raw occupied values: ", lastSeenDate)
                const currentTime = Date.now();
                const timeDifference = currentTime - lastSeenDate.getTime();

                if (lastOccupiedBool === true) { 
                    isOccupied.value = true;
                } else { 
                    isOccupied.value = false;
                }

                if (timeDifference <= ONLINE_TIMEOUT_MILLIS) { 
                    isOnline.value = true
                } else { 
                    isOnline.value = false
                }
                // isOnline.value = timeDifference <= ONLINE_TIMEOUT_MILLIS;
                const lastSeenCET = lastSeenDate.toLocaleString('en-GB', { 
                    timeZone: 'Europe/Zurich',
                    dateStyle: 'short',
                    timeStyle: 'medium'
                });
                
                console.log(`Device ${isOnline.value ? 'ONLINE' : 'OFFLINE'}`);
                console.log(`Last seen: ${Math.floor(timeDifference / 1000)}s ago (${lastSeenCET} CET)`);
                console.log(`Raw timestamp: ${lastOccupied.data[0].created_at}`);
                console.log(`Time difference: ${timeDifference}ms, Threshold: ${ONLINE_TIMEOUT_MILLIS}ms`);
            } else { 
                console.log("No occupancy data found");
                // isOnline.value = false;
            }

        } catch (err) {
            console.error('Error loading data:', err);
            globalError.value = err.message;
            isOnline.value = false;
            isOccupied.value = false;
        } finally {
            globalLoading.value = false;
        }
    }

    const loadSleepSummary = async () => {
    if (!globalDeviceId.value) {
        console.error('No device ID available')
        return
    }
    
    globalLoading.value = true
    globalError.value = null
    
    try {
        const { getSleepDayBoundary } = useUserSettings()
        const sleepBoundary = getSleepDayBoundary()
        
        const config = useRuntimeConfig()
        const apiBase = config.public.apiBase
        
        const response = await $fetch(`${apiBase}/sleep/${globalDeviceId.value}/summary`, {
        params: {
            period: globalPeriod.value,
            date: globalDate.value,
            sleep_boundary_hour: sleepBoundary.hour
        }
        })
        
        globalSleepSummary.value = response
        console.log('Sleep summary loaded:', response)
        return response
        
    } catch (error) {
        console.error('Failed to load sleep summary:', error)
        globalError.value = error
        throw error
    } finally {
        globalLoading.value = false
    }
    }
    const loadUserSettings = async () => {
        try {
            const config = useRuntimeConfig()
            const response = await $fetch(`${config.public.apiBase}/user-settings/${globalDeviceId.value}`)
            
            if (response?.data?.[0]) {
            const settings = response.data[0]
            const { setBedTime, setWakeUpTime, setBedTimeTolerance, setWakeUpTolerance } = useUserSettings()
            
            setBedTime(settings.bed_time)
            setWakeUpTime(settings.wake_up_time)
            setBedTimeTolerance(settings.bed_time_tolerance)
            setWakeUpTolerance(settings.wake_up_tolerance)
            
            console.log('User settings loaded:', settings)
            }
        } catch (error) {
            console.error('Failed to load user settings:', error)
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
                    device_id: (globalDeviceId.value).toString(),
                    command: command.toString(),
                    payload: payload
                })
            });
            
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            
            const data = await res.json();
            showCommandStatus(`Command '${command}' sent successfully`, 'success');
            console.log('Command sent:', data);

        } catch (error) {
            console.error('Error sending command:', error);
            showCommandStatus(`Failed to send command: ${error.message}`, 'error');
            
            // Clear pending on error
            const commandType = command.includes('_') 
                ? command.substring(0, command.lastIndexOf('_')) 
                : command;
            clearPendingCommand(commandType);
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
        globalDeviceSettings,
        globalLoading,
        globalError,
        globalCommandStatus,
        isOn,
        isOnline,
        isOccupied,
        isSafety,
        isMotorError,
        pendingCommands,
        lastCommandTime,
        globalPeriod,
        globalDate,
        
        // Functions
        loadDeviceData,
        loadSleepSummary,
        loadDeviceSettings,
        loadLastOccupied,
        sendCommand,
        showCommandStatus,
        setPendingCommand,
        clearPendingCommand,
        shouldBlockUpdate,
        loadUserSettings,
        
        // Helpers
        formatDate,
        formatTime
    }

}