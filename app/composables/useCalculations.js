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
    const globalSummaryLoading = ref(false);
    // let globalSummaryLoading = useState('globalLoading', () => false)
    
    
    const intervalGrouping = computed(() => { 
        if (!props.intervals.length) return [];
        const groups = [];
        let currentGroup = [props.intervals[0]];
        for (let i = 1; i < props.intervals.length; i++) {
            const previousInterval = props.intervals[i - 1];
            const currentInterval = props.intervals[i];
            const gap = new Date(currentInterval.start) - new Date(previousInterval.end);
            const fiveMinutesInMs = 5 * 60 * 1000; // 300000
            
            if (gap < fiveMinutesInMs) {
                currentGroup.push(currentInterval);
            } else {
                groups.push(currentGroup);
                currentGroup = [currentInterval];
            }
        }
        
        groups.push(currentGroup);
        
        // Filter out groups where total duration is less than 5 minutes
        const validGroups = groups.filter(group => {
            const totalDuration = group.reduce((sum, interval) => sum + interval.duration_min, 0);
            console.log("totalDuration:", totalDuration)
            return totalDuration >= 20;
        });
        console.log("valid: ", validGroups)
        return validGroups;
    });

    return {
        //Intervals
        intervalGrouping
    }

}